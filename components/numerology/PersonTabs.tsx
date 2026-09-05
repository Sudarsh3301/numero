'use client';
import React, { useState } from 'react';
import { PERSON_COLORS } from '@/lib/theme';
import { DriverConductorCard } from './DriverConductorCard';
import { ArrowsPanel } from './ArrowsPanel';
import { PlaneBar } from './PlaneBar';
import { PlanetDayCard } from './PlanetDayCard';
import { RemediesCard } from './RemediesCard';
import { HealthCard } from './HealthCard';
import { PersonalYearCard } from './PersonalYearCard';
import { NarrativeCard } from './NarrativeCard';
import { ComplementaryCard } from './ComplementaryCard';
import { RepetitionCard } from './RepetitionCard';

interface PersonTabsProps {
  m1: any;
  m2: any;
  label1?: string;
  label2?: string;
  lang?: string;
  narrative1?: any;
  narrative2?: any;
  narrativeLoading?: boolean;
  narrativeError?: string;
  onRetryNarrative?: () => void;
}

export default function PersonTabs({
  m1, m2,
  label1 = 'Person 1', label2 = 'Person 2',
  narrative1, narrative2,
  narrativeLoading, narrativeError,
  onRetryNarrative,
}: PersonTabsProps) {
  const [active, setActive] = useState<'p1' | 'p2'>('p1');
  const profile = active === 'p1' ? m1 : m2;
  const narrative = active === 'p1' ? narrative1 : narrative2;
  const color = active === 'p1' ? PERSON_COLORS.p1 : PERSON_COLORS.p2;
  const label = active === 'p1' ? label1 : label2;

  return (
    <div className="w-full">
      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        {(['p1', 'p2'] as const).map((key) => {
          const lbl = key === 'p1' ? label1 : label2;
          const clr = PERSON_COLORS[key];
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className="px-4 py-2 rounded-card text-sm font-semibold border transition-all"
              style={
                active === key
                  ? { backgroundColor: clr, borderColor: clr, color: '#fff' }
                  : { borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)' }
              }
            >
              {lbl}
            </button>
          );
        })}
      </div>

      {/* Detail cards for active person */}
      <div className="flex flex-col gap-6">
        <DriverConductorCard m={profile} label={label} color={color} />
        <PlaneBar planes={profile.planes} color={color} />
        <ArrowsPanel arrows={profile.arrows} />
        {profile.repetitionEffects?.length > 0 && <RepetitionCard effects={profile.repetitionEffects} />}
        <ComplementaryCard missing={profile.missing} present={profile.present} label={label} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PlanetDayCard
            driver={profile.driver}
            conductor={profile.conductor}
            driverPlanet={profile.rulingPlanet?.name}
            conductorPlanet={profile.conductorPlanet?.name}
            label={label}
          />
          <RemediesCard remedies={profile.remedies || []} label={label} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PersonalYearCard personalYear={profile.personalYear} label={label} />
          <HealthCard health={profile.healthProfile} age={profile.age} label={label} />
        </div>
        {(narrative?.sections || narrativeLoading || narrativeError) && (
          <NarrativeCard
            sections={narrative?.sections ?? []}
            isGenerating={narrativeLoading ?? false}
            errorMessage={narrativeError}
            onGenerate={onRetryNarrative}
          />
        )}
      </div>
    </div>
  );
}
