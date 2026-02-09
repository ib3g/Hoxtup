'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarDays, Clock } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface DateTimePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function DateTimePicker({ value, onChange, placeholder, className }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)

  const date = value ? new Date(value) : undefined
  const [time, setTime] = React.useState(() => {
    if (date) {
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }
    return '09:00'
  })

  function handleDaySelect(day: Date | undefined) {
    if (!day) return
    const [hours, minutes] = time.split(':').map(Number)
    day.setHours(hours, minutes, 0, 0)
    onChange(day.toISOString())
  }

  function handleTimeChange(newTime: string) {
    setTime(newTime)
    if (date) {
      const [hours, minutes] = newTime.split(':').map(Number)
      const updated = new Date(date)
      updated.setHours(hours, minutes, 0, 0)
      onChange(updated.toISOString())
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className={cn(
            'w-full justify-start text-left font-normal h-12',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarDays className="size-4 mr-2 shrink-0" />
          {date ? format(date, 'dd MMM yyyy · HH:mm', { locale: fr }) : (placeholder ?? 'Choisir date & heure')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={date}
          onSelect={handleDaySelect}
          locale={fr}
          className="p-3"
          classNames={{
            months: 'flex flex-col sm:flex-row gap-2',
            month: 'flex flex-col gap-4',
            month_caption: 'flex justify-center pt-1 relative items-center text-label capitalize',
            nav: 'flex items-center gap-1',
            button_previous: 'absolute left-1 size-7 bg-transparent p-0 text-muted-foreground hover:text-foreground',
            button_next: 'absolute right-1 size-7 bg-transparent p-0 text-muted-foreground hover:text-foreground',
            month_grid: 'w-full border-collapse',
            weekdays: 'flex',
            weekday: 'text-muted-foreground rounded-md w-9 font-normal text-micro',
            week: 'flex w-full mt-1',
            day: 'size-9 text-center text-caption p-0 relative',
            day_button: 'size-9 p-0 font-normal rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer',
            selected: 'bg-brand-primary text-white hover:bg-brand-primary hover:text-white rounded-md',
            today: 'bg-accent text-accent-foreground rounded-md',
            outside: 'text-muted-foreground/50',
            disabled: 'text-muted-foreground/30',
          }}
        />
        <div className="border-t px-3 py-3 flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" />
          <Input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="h-9 w-auto"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
