import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

// ─── 型別與常數（step1：評估規則）────────────────────────────────────────────

/** 衛福部國健署成人 BMI 分級 */
export enum BmiCategory {
  Underweight = 'underweight',
  Normal = 'normal',
  Overweight = 'overweight',
  MildObesity = 'mildObesity',
  ModerateObesity = 'moderateObesity',
  SevereObesity = 'severeObesity',
}

export enum Gender {
  Male = 'male',
  Female = 'female',
}

/** 分級門檻（公斤／公分公式下之數值區間） */
export const BMI_THRESHOLDS = {
  normalMin: 18.5,
  overweightMin: 24,
  mildObesityMin: 27,
  moderateObesityMin: 30,
  severeObesityMin: 35,
} as const

type BmiRangeRule = {
  category: BmiCategory
  label: string
  min: number
  max: number | null
}

/** 成人共用數值區間（國健署標準） */
const ADULT_BMI_RULES: readonly BmiRangeRule[] = [
  { category: BmiCategory.Underweight, label: '過輕', min: 0, max: BMI_THRESHOLDS.normalMin },
  {
    category: BmiCategory.Normal,
    label: '正常',
    min: BMI_THRESHOLDS.normalMin,
    max: BMI_THRESHOLDS.overweightMin,
  },
  {
    category: BmiCategory.Overweight,
    label: '過重',
    min: BMI_THRESHOLDS.overweightMin,
    max: BMI_THRESHOLDS.mildObesityMin,
  },
  {
    category: BmiCategory.MildObesity,
    label: '輕度肥胖',
    min: BMI_THRESHOLDS.mildObesityMin,
    max: BMI_THRESHOLDS.moderateObesityMin,
  },
  {
    category: BmiCategory.ModerateObesity,
    label: '中度肥胖',
    min: BMI_THRESHOLDS.moderateObesityMin,
    max: BMI_THRESHOLDS.severeObesityMin,
  },
  {
    category: BmiCategory.SevereObesity,
    label: '重度肥胖',
    min: BMI_THRESHOLDS.severeObesityMin,
    max: null,
  },
] as const

const CATEGORY_STYLES: Record<
  BmiCategory,
  { badge: string; ring: string; bar: string }
> = {
  [BmiCategory.Underweight]: {
    badge: 'bg-sky-100 text-sky-800',
    ring: 'ring-sky-200',
    bar: 'bg-sky-400',
  },
  [BmiCategory.Normal]: {
    badge: 'bg-emerald-100 text-emerald-800',
    ring: 'ring-emerald-200',
    bar: 'bg-emerald-500',
  },
  [BmiCategory.Overweight]: {
    badge: 'bg-amber-100 text-amber-800',
    ring: 'ring-amber-200',
    bar: 'bg-amber-400',
  },
  [BmiCategory.MildObesity]: {
    badge: 'bg-orange-100 text-orange-800',
    ring: 'ring-orange-200',
    bar: 'bg-orange-400',
  },
  [BmiCategory.ModerateObesity]: {
    badge: 'bg-rose-100 text-rose-800',
    ring: 'ring-rose-200',
    bar: 'bg-rose-400',
  },
  [BmiCategory.SevereObesity]: {
    badge: 'bg-red-100 text-red-900',
    ring: 'ring-red-200',
    bar: 'bg-red-500',
  },
}

/** 依性別調整的區間說明與健康提示（數值門檻相同，文案依生理差異微調） */
const GENDER_GUIDANCE: Record<
  Gender,
  Record<BmiCategory, { rangeHint: string; tip: string }>
> = {
  [Gender.Male]: {
    [BmiCategory.Underweight]: {
      rangeHint: 'BMI 低於 18.5，建議留意肌肉量與營養攝取',
      tip: '可適度增加優質蛋白質與阻力訓練，並諮詢營養師評估熱量是否足夠。',
    },
    [BmiCategory.Normal]: {
      rangeHint: 'BMI 18.5–24，維持規律運動與均衡飲食',
      tip: '建議每週至少 150 分鐘中等強度有氧，並留意腹部腰圍（建議 < 90 公分）。',
    },
    [BmiCategory.Overweight]: {
      rangeHint: 'BMI 24–27，建議開始調整飲食與活動量',
      tip: '減少含糖飲料與精緻澱粉，搭配每週 3 次以上肌力＋有氧運動。',
    },
    [BmiCategory.MildObesity]: {
      rangeHint: 'BMI 27–30，心血管風險上升',
      tip: '可設定每週 0.5 公斤緩步減重目標，並追蹤血壓、血脂與腰圍變化。',
    },
    [BmiCategory.ModerateObesity]: {
      rangeHint: 'BMI 30–35，建議尋求專業協助',
      tip: '建議至家醫科或減重門診評估，制定可持續的飲食與運動計畫。',
    },
    [BmiCategory.SevereObesity]: {
      rangeHint: 'BMI ≥ 35，需積極管理體重與共病',
      tip: '請儘早與醫療團隊討論綜合介入（飲食、運動、行為與必要時藥物）。',
    },
  },
  [Gender.Female]: {
    [BmiCategory.Underweight]: {
      rangeHint: 'BMI 低於 18.5，注意營養與骨質健康',
      tip: '確保鈣質、鐵質與足夠熱量，若有月經紊亂請諮詢婦產或營養專業。',
    },
    [BmiCategory.Normal]: {
      rangeHint: 'BMI 18.5–24，維持健康體態',
      tip: '建議每週規律運動，並留意腰圍（建議 < 80 公分）與肌力平衡。',
    },
    [BmiCategory.Overweight]: {
      rangeHint: 'BMI 24–27，可開始溫和調整生活型態',
      tip: '增加蔬菜與全穀比例，減少宵夜與高糖點心，搭配伸展與有氧運動。',
    },
    [BmiCategory.MildObesity]: {
      rangeHint: 'BMI 27–30，代謝負擔增加',
      tip: '建議記錄飲食與睡眠，設定可行的小目標，必要時尋求營養諮詢。',
    },
    [BmiCategory.ModerateObesity]: {
      rangeHint: 'BMI 30–35，建議醫療評估',
      tip: '可與醫師討論體重管理計畫，並關注血糖、血壓等代謝指標。',
    },
    [BmiCategory.SevereObesity]: {
      rangeHint: 'BMI ≥ 35，需積極介入',
      tip: '請儘早接受完整評估，兼顧心理支持與可長期執行的生活改變。',
    },
  },
}

// ─── 工具函式 ───────────────────────────────────────────────────────────────

/** BMI = weight(kg) / (height(m))² */
export function calculateBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

export function formatBmiValue(bmi: number): string {
  return bmi.toFixed(2)
}

/** 依數值解析分級（左閉右開，最後一級為 ≥35） */
export function resolveBmiCategory(bmi: number): BmiRangeRule {
  for (const rule of ADULT_BMI_RULES) {
    const belowMax = rule.max === null || bmi < rule.max
    if (bmi >= rule.min && belowMax) return rule
  }
  return ADULT_BMI_RULES[ADULT_BMI_RULES.length - 1]
}

export type BmiAssessment = {
  bmi: number
  bmiText: string
  category: BmiCategory
  label: string
  rangeHint: string
  tip: string
}

export function assessBmi(
  weightKg: number,
  heightCm: number,
  gender: Gender,
): BmiAssessment {
  const bmi = calculateBmi(weightKg, heightCm)
  const rule = resolveBmiCategory(bmi)
  const guidance = GENDER_GUIDANCE[gender][rule.category]

  return {
    bmi,
    bmiText: formatBmiValue(bmi),
    category: rule.category,
    label: rule.label,
    rangeHint: guidance.rangeHint,
    tip: guidance.tip,
  }
}

function formatRangeLabel(rule: BmiRangeRule): string {
  if (rule.max === null) return `≥ ${rule.min}`
  if (rule.min === 0) return `< ${rule.max}`
  return `${rule.min} – ${rule.max}`
}

// ─── 表單與元件（step2：互動介面）────────────────────────────────────────────

type BmiFormValues = {
  weight: string
  height: string
  gender: Gender
}

const defaultValues: BmiFormValues = {
  weight: '',
  height: '',
  gender: Gender.Male,
}

function parsePositiveNumber(raw: string): number | null {
  const value = Number(raw)
  if (!Number.isFinite(value) || value <= 0) return null
  return value
}

export default function BmiCalculator() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BmiFormValues>({ defaultValues, mode: 'onSubmit' })

  const gender = watch('gender')
  const [result, setResult] = useState<BmiAssessment | null>(null)

  const onSubmit = handleSubmit((values) => {
    const weight = parsePositiveNumber(values.weight)
    const height = parsePositiveNumber(values.height)
    if (weight === null || height === null) return

    setResult(assessBmi(weight, height, values.gender))
  })

  const activeStyle = result ? CATEGORY_STYLES[result.category] : null

  const scalePosition = useMemo(() => {
    if (!result) return 0
    const clamped = Math.min(Math.max(result.bmi, 15), 40)
    return ((clamped - 15) / 25) * 100
  }, [result])

  return (
    <div className="w-full max-w-lg">
      <article className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-emerald-900/10 ring-1 ring-emerald-100">
        <header className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-6 text-white">
          <p className="text-sm font-medium text-emerald-100">健康自我管理</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">成人 BMI 計算機</h1>
          <p className="mt-2 text-sm leading-relaxed text-emerald-50/90">
            依衛生福利部國民健康署成人 BMI 分級，快速了解體重狀態
          </p>
        </header>

        <form onSubmit={onSubmit} className="space-y-5 px-6 py-6" noValidate>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-700">性別</legend>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="性別">
              {(
                [
                  { value: Gender.Male, label: '男性' },
                  { value: Gender.Female, label: '女性' },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className={[
                    'flex cursor-pointer items-center justify-center rounded-xl border-2 px-4 py-3 text-sm font-medium transition',
                    gender === option.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    value={option.value}
                    className="sr-only"
                    {...register('gender', { required: true })}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                體重（公斤）
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="1"
                placeholder="例如 60"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
                {...register('weight', {
                  required: '請輸入體重',
                  validate: (v) => parsePositiveNumber(v) !== null || '請輸入有效的體重',
                })}
              />
              {errors.weight && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {errors.weight.message}
                </p>
              )}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                身高（公分）
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="1"
                placeholder="例如 170"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
                {...register('height', {
                  required: '請輸入身高',
                  validate: (v) => parsePositiveNumber(v) !== null || '請輸入有效的身高',
                })}
              />
              {errors.height && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {errors.height.message}
                </p>
              )}
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            計算 BMI
          </button>
        </form>

        {result && activeStyle && (
          <section
            className={`mx-6 mb-6 rounded-2xl bg-slate-50 p-5 ring-2 ${activeStyle.ring}`}
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">您的 BMI</p>
                <p className="text-4xl font-bold tabular-nums text-slate-900">
                  {result.bmiText}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${activeStyle.badge}`}
              >
                {result.label}
              </span>
            </div>

            <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`absolute left-0 top-0 h-full rounded-full transition-all ${activeStyle.bar}`}
                style={{ width: `${scalePosition}%` }}
              />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-700">{result.rangeHint}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{result.tip}</p>
          </section>
        )}

        <footer className="border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {gender === Gender.Male ? '男性' : '女性'}參考區間（國健署成人標準）
          </p>
          <ul className="grid gap-1.5 text-xs text-slate-600">
            {ADULT_BMI_RULES.map((rule) => {
              const hint = GENDER_GUIDANCE[gender][rule.category].rangeHint
              const isActive = result?.category === rule.category
              return (
                <li
                  key={rule.category}
                  className={[
                    'flex justify-between gap-2 rounded-lg px-2 py-1',
                    isActive && 'bg-white font-medium text-emerald-800 shadow-sm',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span>
                    {rule.label}{' '}
                    <span className="text-slate-400">({formatRangeLabel(rule)})</span>
                  </span>
                  <span className="hidden text-right text-slate-500 sm:inline">{hint}</span>
                </li>
              )
            })}
          </ul>
        </footer>
      </article>

      <p className="mt-4 text-center text-xs text-slate-500">
        本工具僅供參考，若有特殊疾病或懷孕等情況，請諮詢醫療專業人員。
      </p>
    </div>
  )
}
