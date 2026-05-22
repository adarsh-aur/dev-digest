# Gemma 4 가 갑자기 답을 못 했다 — 외부 협업이 24시간 만에 root cause 찾아낸 이야기

Category: development

Published: Fri, 22 May 2026 08:51:00 +0000

Source: https://dev.to/hashevolution/gemma-4-ga-gabjagi-dabeul-mos-haessda-oebu-hyeobeobi-24sigan-mane-root-cause-cajanaen-iyagi-5lg

---

## Summary

TL;DR (한 문단)
시작: "왜 빈 응답이지?"
자메스 (PROJECT JAMES) 는 로컬에서 돌아가는 Graph-RAG 시스템입니다. Ollama 위에 Gemma 4 의 efficient 변형 (gemma4:e4b, 4B 파라미터) 을 기본 모델로 사용합니다.
v0.3 의 cognitive middleware layer 가 phase 2 를 출하하면서 — query rewriter, planner, reflect, verify, fact-check 같은 단계가 추가되었는데 — 이상한 패턴이 발견됐습니다.
코드
같은 모델인데 어떤 stage 는 잘 작동하고, 어떤 stage 는 무조건 0자 응답. gemma3:12b (12B) 로 바꾸면 9/9 통과. 모델 변경만으로 해결되지만, 왜 그런지가 미궁.
2026-05-18 에 fair-witness 보고서를 dev.to 에 게시: 4 가지 가설을 제시하고 답을 단정하지 않음.
가설 A: 4B 모델의 메타-추론 capacity floor
가설 B: 짧은 구조화 prompt 에서 early stop-token
가설 C: 한국어 지시 + 영어 JSON 키 혼합 confusion
가설 D: JAMES 측 prompt truncation 버그
외부 데이터 환영. 외부 reader 가 어느 가설을 falsify 하든 confirm 하든 보고서에 누적.
Ali Afana 의 walk-back — 다른 deployment context 에서 같은 패턴
며칠 후, Ali Afana 가 dev.to 에서 Gemma 4 의 다른 변형 (31B Dense vs 26B MoE) 에 대해 본인의 분석을 공개했습니다. 첫 주장: "두 architecture 의 동작 차이는 architecture 때문이다."
그런데 Robin Converse (Triava Labs) 가 본인의 sovereign Ollama 환경에서 단순 검증을 했습니다 — max_tokens cap 을 풀고 같은 시나리오를 돌렸더니 18/18 다 통과. 그녀가 Ali 에게 던진 질문: "managed Gemini 쪽에서 cap 을 풀면 어떻게 되나요?"
Ali 가 단일 변수 재실험: max_tokens 400 → 4096. Dense 12/12, MoE 12/12 — 모두 회복.
그 결과로 Ali 는 본인의 article 을 공개적으로 walk-back: "차이는 architecture 가 아니라 token cap 이었다."
walk-back article 에서 그는 자메스의 production default 를 3rd cross-validation context 로 명시:
Source
Context
Test
Result
Robin Converse
sovereign Ollama, uncapped
6 시나리오 × 3 온도
18/18
Ali Afana
managed Gemini, 400 → 4096
12 calls
12/12 회복
JAMES (자메스)
local Ollama, default 200/400/400/400
5/6 stages
빈 응답
자메스 측 검증: V3' 단일 변수 실험
자메스 코드를 점검해 보니 충격적인 일치:
Stage
자메스 default
Ali 의 failing cap
query_rewriter.py:46
200
400
planner.py:43
400
400 ← 정확 일치
reflect.py:54 (CRITIQUE)
400
400 ← 정확 일치
verify.py:69 (FACT_CHECK)
400
400 ← 정확 일치
자메스의 production default 가 정확히 Ali 의 failing threshold 였습니다. 우리도 모르고 있었던 일치.
이제 단일 변수로 검증할 차례. V3' 라고 명명한 사내 실험:
V3'.a — query_rewriter stage (n=10 per cap)
코드
이게 의미하는 바: gemma4:e4b 가 visible output 첫 token 직전까지 ~500 token 의 hidden reasoning 을 소비합니다. Cap 이 이 floor 이하면 모델은 visible byte 하나도 emit 못 함. 100% deterministic empty.
Ali 가 본인 article 에서 "starving the reasoning layer" 라고 비유한 패턴을 토큰 수준에서 정량 측정 한 셈입니다.
V3'.b — planner stage (n=10 per cap)
코드
Cross-stage 진단:
Metric
V3'.a (cap 200)
V3'.b (cap 400)
해석
Default-cap latency
2.1s
4.3s
Cap 의 2배 → 시간도 정확히 2배
4096-cap latency
5.3s
7.1s
+1.8s for planner 의 추가 reasoning
200 cap 의 latency 가 2.1s, 400 cap 이 4.3s — 선형 비례. 즉 ~500 token 의 reasoning floor 가 stage 와 무관한 모델 수준 특성. Cap 만큼의 시간을 선형으로 소진하다가 visible output 1 byte 도 emit 못 한 채 종료.
가설 공간 정리
✅ B (token budget): 확정 — mechanism 까지 측정
❌ A (4B floor): 사실상 기각 — 같은 모델이 cap 만 풀면 정상 작동
🤷 C, D: 변동 없음 (검증 안 됨)
⏸ E (-tag 후처리): cross-stage 일관성으로 약화
The Fix — 4 line code change
PR #399: 4 개 stage 의 DEFAULT_MAX_TOKENS 상수를 4096 으로 bump.
Diff
각 변경에는 stable-WHY 코멘트 추가 — 미래 maintainer 가 "왜 4096 인가" 를 코드만 보고 이해할 수 있도록.
STEP 7 bench (13개 query 회귀 테스트, gemma3:12b 권장 모델 기준): 13/13 baseline tolerance 내. 변경의 비파괴성 확인.
Squash-merge 머지 완료.
향후 진행
즉시 (1-3일)
V3'.c (reflect.critique) + V3'.d (verify.fact_check) post-merge validation. 같은 protocol, 같은 모델, 같은 default 400 — 동일 패턴 재현 강한 prior. Unexpected drift 면 single-line revert
synth.web_summary 의 inline max_tokens=300 (core/reasoning/pipeline_synth.py:141) 도 ~500 floor 아래 — 별도 PR 로 fix
중기 (Mid-June)
Ali Afana 의 Gemini backend implementation PR 도착 예정 (Track 1 Provider contract 가 이미 설정해놓은 surface)
Track 3 STEP 7 cross-experiment: 자메스 (Ollama local) + Ali (Gemini API) 의 swap eval — 같은 wiki corpus 에서 두 backend 의 retrieval-conditioning + synthesis layer 비교
장기 (Joint piece, Track 5)
Robin Converse 의 temperature sweep post + 자메스 cross-experiment + Ali Gemini 결과를 3-name joint piece 로 출판
가제: "3 contexts, 2 architectures, 1 mechanism" — 세 운영 환경에서 같은 mechanism 을 관찰한 협업 사례
이 이야기에서 배운 것
기술적으로
LLM 의 "빈 응답" 은 종종 모델 capability 가 아니라 budget 부족. Cap 이 hidden reasoning floor 이하면 visible output 전에 cap 도달.
gemma4:e4b 의 hidden-to-visible token ratio 는 약 5-6:1 (단일 stage 측정). 이건 모델 수준 특성으로 보임.
한 prompt 가 require 하는 reasoning budget 을 측정 없이 cap 잡으면 deterministic 실패의 함정. 운영 default 는 모델별로 floor 측정 후 결정해야 함.
협업으로
외부 사람이 본인의 hypothesis 를 honest 하게 walk-back 하는 것 이 협업의 가장 큰 가치. Ali 가 본인 article 을 공개적으로 정정한 결과로, 세 명의 deployment context 가 24시간 안에 cross-validation 완성.
공개 fair-witness 보고서 의 가치 — 외부 사람이 그것을 reference 로 인용하면서 연구의 chain 이 형성됨. 닫힌 연구 노트에서는 불가능한 형식.
Single-variable test 의 힘. Ali 가 본인의 가설을 검증한 방식, 우리가 그것을 자메스에서 검증한 방식, 모두 한 변수만 바꿔서 다른 모든 것 고정. Mechanism 격리에 필수.
링크
자메스 fair-witness 보고서 (2026-05-18): https://dev.to/hashevolution/5-empty-responses-from-gemma4e4b-4-hypotheses-0-root-cause-1ggd
Ali Afana walk-back article: https://dev.to/alimafana/i-raised-gemma-4s-token-cap-the-dense-model-stopped-refusing-2gf3
자메스 GitHub repo: https://github.com/Hashevolution/James-RAG-Evol
PR #399 (cap fix 머지됨): https://github.com/Hashevolution/James-RAG-Evol/pull/399

---

## Notes
- Add insightful notes here
