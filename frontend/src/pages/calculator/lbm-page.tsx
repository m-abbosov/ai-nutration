import { useState } from 'react'
import { useTranslation } from '@nutriai/shared/i18n'
import { fmtDecimal } from '@nutriai/shared/lib/format'
import type { Gender } from '@nutriai/shared/api/types'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { calculateLeanBodyMass } from '@/entities/calculator/lib/formulas'
import { CalculatorShell, ErrorBanner, ResultHero, ResultPlaceholder } from './calculator-shell'
import { FormulaTable } from './formula-table'
import { StatGrid } from './stat-grid'

export default function LbmPage() {
  const { t, lang } = useTranslation()
  const [gender, setGender] = useState<Gender>('MALE')
  const [heightCm, setHeightCm] = useState('175')
  const [weightKg, setWeightKg] = useState('72')

  const h = parseFloat(heightCm)
  const w = parseFloat(weightKg)
  const ok = h > 0 && w > 0

  const result = ok ? calculateLeanBodyMass(gender, h, w) : null

  return (
    <CalculatorShell
      calcId="lbm"
      inputs={
        <div>
          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2">
              <Label>{t.app.genderLabelField}</Label>
              <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">{t.genderLabel.MALE}</SelectItem>
                  <SelectItem value="FEMALE">{t.genderLabel.FEMALE}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="height">{t.calcPages.fields.height} · CM</Label>
              <Input id="height" type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="weight">{t.calcPages.fields.weight} · KG</Label>
              <Input id="weight" type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </div>
          </div>
          {!ok && <ErrorBanner message={t.calcPages.invalidInput} />}
        </div>
      }
      results={
        result ? (
          <>
            <ResultHero kicker={t.calcPages.lbm.resultLabel} value={fmtDecimal(result.boerKg, lang, 1)} unit="kg" />
            <StatGrid cells={[{ label: t.calcPages.lbm.fatMass, value: `${fmtDecimal(result.fatMassKg, lang, 1)} kg` }]} />
            <FormulaTable
              rows={[
                { label: t.calcPages.lbm.boer, value: `${fmtDecimal(result.boerKg, lang, 1)} kg`, highlight: true },
                { label: t.calcPages.lbm.james, value: `${fmtDecimal(result.jamesKg, lang, 1)} kg` },
                { label: t.calcPages.lbm.hume, value: `${fmtDecimal(result.humeKg, lang, 1)} kg` },
              ]}
            />
          </>
        ) : (
          <ResultPlaceholder title={t.calcPages.resultEmptyTitle} body={t.calcPages.resultEmptyBody} />
        )
      }
    />
  )
}
