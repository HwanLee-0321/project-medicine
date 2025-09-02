// app/features/senior/components/Chat.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { colors } from '@styles/colors';

// ✅ 서비스 모듈만 사용 (데이터 접근 분리)
import {
  loadElderContext,
  confirmIntake,
  type MealTimes,
  type MedicationItem,
} from '@app/_utils/user_service';

// ---------- ✨ 여기에 네 ngrok 주소를 넣어주세요 ✨ ----------
const GEMINI_API_URL = "https://26894e5acd2d.ngrok-free.app";
const MELOTTS_API_URL = "https://1f04b7f79925.ngrok-free.app";
// -------------------------------------------------------------

type Message = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  quickReplies?: Array<{ id: 'yes' | 'no'; label: string; value: string }>;
};

export default function ChatScreen() {
  const router = useRouter();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);

  // 컨텍스트 상태 (기록/프롬프트에 사용)
  const [meal, setMeal] = useState<MealTimes | null>(null);
  const [elderName, setElderName] = useState<string>('어르신');
  const [meds, setMeds] = useState<MedicationItem[] | null>(null);

  const flatRef = useRef<FlatList<Message>>(null);

  // expo-av 동적 로드(환경 가드)
  let AudioMod: typeof import('expo-av').Audio | null = null;
  const soundRef = useRef<import('expo-av').Audio.Sound | null>(null);
  const ensureAudio = useCallback(async () => {
    if (!AudioMod) {
      const mod = await import('expo-av');
      AudioMod = mod.Audio;
      await AudioMod.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        allowsRecordingIOS: false,
        interruptionModeAndroid: 1,
        shouldDuckAndroid: true,
      });
    }
    return AudioMod!;
  }, []);

  // 메시지 추가(자동 id)
  const addMessage = useCallback((m: Omit<Message, 'id'>) => {
    setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, ...m }]);
  }, []);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      flatRef.current?.scrollToEnd({ animated: true });
    });
  }, []);
  useEffect(scrollToEnd, [messages.length, scrollToEnd]);

  useEffect(() => {
    return () => {
      (async () => {
        try {
          if (soundRef.current) {
            await soundRef.current.stopAsync().catch(() => {});
            await soundRef.current.unloadAsync().catch(() => {});
            soundRef.current = null;
          }
        } catch {}
      })();
    };
  }, []);

  // ArrayBuffer → base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const bytes = new Uint8Array(buffer);
    let base64 = '';
    for (let i = 0; i < bytes.length; i += 3) {
      const c1 = bytes[i] ?? 0;
      const c2 = bytes[i + 1];
      const c3 = bytes[i + 2];

      const e1 = c1 >> 2;
      const e2 = ((c1 & 3) << 4) | ((c2 ?? 0) >> 4);
      const e3 = (((c2 ?? 0) & 15) << 2) | ((c3 ?? 0) >> 6);
      const e4 = (c3 ?? 0) & 63;

      if (c2 === undefined) {
        base64 += chars.charAt(e1) + chars.charAt(e2) + '==';
      } else if (c3 === undefined) {
        base64 += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + '=';
      } else {
        base64 += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4);
      }
    }
    return base64;
  };

  // 모델 호출
  const askGemini = async (prompt: string) => {
    const res = await axios.post(`${GEMINI_API_URL}/generate-text`, { prompt });
    return res.data?.text ?? '';
  };

  // 서버 TTS
  const playBase64Audio = async (base64: string, mime: 'audio/mpeg' | 'audio/wav' | 'audio/ogg' = 'audio/mpeg') => {
    try {
      const Audio = await ensureAudio();
      if (!base64) return;
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:${mime};base64,${base64}` },
        { shouldPlay: true }
      );
      soundRef.current = sound;
    } catch (e) {
      console.warn('오디오 재생 실패:', e);
    }
  };
  const synthTTS = async (text: string) => {
    try {
      const res = await axios.post(
        `${MELOTTS_API_URL}/convert/tts`,
        { text, language: 'KR', speaker_id: 'KR' },
        { responseType: 'arraybuffer' }
      );
      const base64 = arrayBufferToBase64(res.data);
      await playBase64Audio(base64, 'audio/mpeg');
    } catch (e) {
      console.warn('TTS 오류:', e);
    }
  };

  // ---- 첫 진입: 컨텍스트 로딩 + AI가 먼저 말하기 ----
  useEffect(() => {
    (async () => {
      setBootLoading(true);
      try {
        const { elder_nm, meal, meds } = await loadElderContext();
        setElderName(elder_nm);
        setMeal(meal);
        setMeds(meds);

        const mealStr = [
          meal?.morning ? `아침 ${meal.morning}` : null,
          meal?.lunch ? `점심 ${meal.lunch}` : null,
          meal?.dinner ? `저녁 ${meal.dinner}` : null,
        ].filter(Boolean).join(' / ');

        const medsStr = (meds && meds.length > 0)
          ? meds.slice(0, 5).map(m => m.name).join(', ') + (meds.length > 5 ? ' 외 …' : '')
          : '등록된 약 목록 없음';

        const systemPrompt =
          `대상자 정보\n- 이름: ${elder_nm}\n- 복약 시간대: ${mealStr || '미설정'}\n- 복약 목록: ${medsStr}\n` +
          `위 정보를 참고하여 친근하고 간결하게 현재 시간대에 맞춰 복약 여부를 먼저 확인해 주세요. ` +
          `첫 문장은 " ${elder_nm} 어르신, 약 드셨어요? "로 시작해 주세요. 예/아니오 버튼 안내까지 포함해 주세요.`;

        let firstText = '';
        try {
          firstText = await askGemini(systemPrompt);
        } catch {
          firstText = `${elder_nm} 어르신, 약 드셨어요?\n아래에서 예 또는 아니오를 눌러주세요.`;
        }

        setMessages([]);
        addMessage({
          sender: 'ai',
          text: firstText,
          quickReplies: [
            { id: 'yes', label: '예', value: '예' },
            { id: 'no', label: '아니오', value: '아니오' },
          ],
        });

        // 음성 출력(선택)
        synthTTS(firstText).catch(() => {});
      } finally {
        setBootLoading(false);
      }
    })();
  }, [addMessage]);

  // ---- 빠른응답(예/아니오) 처리 ----
  const handleQuickReply = useCallback(async (reply: { id: 'yes' | 'no'; label: string; value: string }) => {
    addMessage({ sender: 'user', text: reply.value });

    // ✅ 복약 확인 기록: 서비스로 위임
    try {
      const res = await confirmIntake(reply.id === 'yes', meal);
      if (!res.ok) console.warn('복약 확인 기록: 라우트 후보 모두 실패');
    } catch (e) {
      console.warn('복약 확인 기록 중 예외:', e);
    }

    // 후속 멘트
    setLoading(true);
    const followUpPrompt =
      reply.id === 'yes'
        ? '사용자가 방금 복약을 완료했다고 답했습니다. 칭찬과 다음 복약 시간을 간단히 안내해 주세요.'
        : '사용자가 아직 복약하지 않았다고 답했습니다. 부드럽고 짧게 지금 복약을 돕는 안내를 해 주세요.';
    try {
      const aiText = await askGemini(followUpPrompt);
      addMessage({ sender: 'ai', text: aiText || (reply.id === 'yes' ? '잘하셨어요! 다음 복약 시간도 잊지 마세요.' : '괜찮아요. 지금 약을 준비해 볼까요?') });
      synthTTS(aiText).catch(() => {});
    } catch {
      addMessage({ sender: 'ai', text: reply.id === 'yes' ? '잘하셨어요! 다음 복약 시간도 잊지 마세요.' : '괜찮아요. 지금 약을 준비해 볼까요?' });
    } finally {
      setLoading(false);
    }
  }, [addMessage, meal]);

  // ---- 일반 텍스트 전송 ----
  const onSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setInput('');
    addMessage({ sender: 'user', text: trimmed });
    setLoading(true);

    try {
      const aiText = await askGemini(trimmed);
      addMessage({ sender: 'ai', text: aiText || '음… 지금은 뭐라고 답해야 할지 모르겠어요.' });
      synthTTS(aiText).catch(() => {});
    } catch (err) {
      console.error(err);
      addMessage({ sender: 'ai', text: '죄송해요, 처리 중 오류가 발생했어요.' });
    } finally {
      setLoading(false);
    }
  }, [input, loading, addMessage]);

  const renderItem = useCallback(({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.bubbleRow, isUser ? styles.rowEnd : styles.rowStart]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}>
            {item.text}
          </Text>

          {!!item.quickReplies?.length && (
            <View style={styles.quickRow}>
              {item.quickReplies.map(q => (
                <TouchableOpacity
                  key={q.id}
                  style={[styles.quickBtn, q.id === 'yes' ? styles.quickYes : styles.quickNo]}
                  onPress={() => handleQuickReply(q)}
                  accessibilityLabel={`빠른응답: ${q.label}`}
                >
                  <Text style={styles.quickText}>{q.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }, [handleQuickReply]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 12, android: 0 })}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} accessibilityLabel="뒤로가기">
            <Text style={styles.headerBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>대화</Text>
          <View style={styles.headerBtn} />
        </View>

        {/* 메시지 영역 */}
        <View style={styles.messagesWrap}>
          {bootLoading ? (
            <View style={styles.bootLoadingBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.bootText}>대상자 정보를 불러오는 중…</Text>
            </View>
          ) : (
            <>
              <FlatList
                ref={flatRef}
                data={messages}
                keyExtractor={(m) => m.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={scrollToEnd}
                onLayout={scrollToEnd}
              />
              {loading && (
                <View style={styles.thinkingRow}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.thinkingText}>생각 중…</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* 입력 영역 */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="메시지를 입력하세요…"
            placeholderTextColor={colors.textSecondary}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            onPress={onSend}
            style={[styles.sendBtn, input.trim() ? styles.sendEnabled : styles.sendDisabled]}
            disabled={!input.trim() || loading}
            accessibilityLabel="메시지 전송"
          >
            <Text style={styles.sendText}>전송</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const BUBBLE_MAX_W = '78%';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex1: { flex: 1 },

  // Header
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.panel,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  headerBtn: {
    width: 42,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: {
    fontSize: 24,
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },

  // Messages
  messagesWrap: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 16,
    gap: 8,
  },
  bubbleRow: {
    width: '100%',
    marginVertical: 2,
  },
  rowStart: { alignItems: 'flex-start' },
  rowEnd: { alignItems: 'flex-end' },

  bubble: {
    maxWidth: BUBBLE_MAX_W,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  aiBubble: {
    backgroundColor: colors.panel,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  aiText: { color: colors.textPrimary },
  userText: { color: colors.onPrimary },

  quickRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  quickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  quickYes: {
    backgroundColor: colors.primary,
  },
  quickNo: {
    backgroundColor: colors.danger,
  },
  quickText: {
    color: colors.onPrimary,
    fontWeight: '600',
  },

  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  thinkingText: { color: colors.textSecondary, fontSize: 13 },

  bootLoadingBox: {
    marginTop: 24,
    alignItems: 'center',
    gap: 8,
  },
  bootText: { color: colors.textSecondary },

  // Input
  inputBar: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.panel,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.background,
    color: colors.textPrimary,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  sendBtn: {
    height: 40,
    minWidth: 66,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendEnabled: {
    backgroundColor: colors.primary,
  },
  sendDisabled: {
    backgroundColor: colors.secondary,
    opacity: 0.6,
  },
  sendText: {
    color: colors.onPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
});
