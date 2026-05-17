import { describe, expect, it } from 'vitest'
import {
  assessBmi,
  BmiCategory,
  calculateBmi,
  formatBmiValue,
  Gender,
} from './components/BmiCalculator'

describe('calculateBmi', () => {
  const cases = [
    { weight: 50, height: 165, expectedBmi: '18.37', category: BmiCategory.Underweight },
    { weight: 60, height: 170, expectedBmi: '20.76', category: BmiCategory.Normal },
    { weight: 70, height: 170, expectedBmi: '24.22', category: BmiCategory.Overweight },
    { weight: 80, height: 170, expectedBmi: '27.68', category: BmiCategory.MildObesity },
    { weight: 90, height: 170, expectedBmi: '31.14', category: BmiCategory.ModerateObesity },
    { weight: 100, height: 170, expectedBmi: '34.60', category: BmiCategory.ModerateObesity },
  ] as const

  it.each(cases)(
    '體重 $weight kg、身高 $height cm → BMI $expectedBmi（$category）',
    ({ weight, height, expectedBmi, category }) => {
      const bmi = calculateBmi(weight, height)
      expect(formatBmiValue(bmi)).toBe(expectedBmi)

      const assessment = assessBmi(weight, height, Gender.Male)
      expect(assessment.bmiText).toBe(expectedBmi)
      expect(assessment.category).toBe(category)
    },
  )
})
