'use client'

import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingStepperProps {
  currentStep: number
}

export function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
  const { t } = useTranslation('properties')

  const steps = [
    t('onboarding.step1'),
    t('onboarding.step2'),
    t('onboarding.step3'),
  ]

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, index) => {
        const stepNum = index + 1
        const isDone = stepNum < currentStep
        const isActive = stepNum === currentStep

        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  isDone && 'bg-success text-white',
                  isActive && 'bg-cta text-white',
                  !isDone && !isActive && 'bg-muted text-muted-foreground',
                )}
              >
                {isDone ? <Check className="size-4" /> : stepNum}
              </div>
              <span
                className={cn(
                  'text-micro',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-8 mb-5 transition-colors',
                  stepNum < currentStep ? 'bg-success' : 'bg-muted',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
