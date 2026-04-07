import { memo, useState, useCallback } from 'react';
import { useNumerologyStore } from '@/store/useNumerologyStore';
import { LoShuGrid } from './LoShuGrid';
import { DriverConductorCard } from './DriverConductorCard';
import { PlaneBar } from './PlaneBar';
import { ArrowsPanel } from './ArrowsPanel';
import { ComplementaryCard } from './ComplementaryCard';
import { NarrativeCard } from './NarrativeCard';
import { PlanetDayCard } from './PlanetDayCard';
import { RemediesCard } from './RemediesCard';
import { PersonalYearCard } from './PersonalYearCard';
import { ChatPanel } from './ChatPanel';
import { HealthCard } from './HealthCard'; // Might be needed

interface NumerologyDashboardProps {
  profile: any; // Single person math-layer profile
  narrative?: any;
  label?: string;
  color?: string;
  isSingle?: boolean;
  // To allow chat optionally if we only render one chat
  chatProps?: {
    chartContext: any;
    lang: string;
    fetchFollowUp: any;
  };
}

export const NumerologyDashboard = memo(function NumerologyDashboard({
  profile,
  narrative,
  label = "Person",
  color = "#a855f7",
  isSingle = false,
  chatProps,
}: NumerologyDashboardProps) {
  const { selectedNumber, setSelectedNumber } = useNumerologyStore();
  const [lockedNumber, setLockedNumber] = useState<number | null>(null);

  const handleCellHover = useCallback((num: number | null) => {
    if (lockedNumber === null) {
      setSelectedNumber(num);
    }
  }, [lockedNumber, setSelectedNumber]);

  const handleCellClick = useCallback((num: number) => {
    setLockedNumber(prev => (prev === num ? null : num));
    setSelectedNumber(lockedNumber === num ? null : num);
  }, [lockedNumber, setSelectedNumber]);

  if (!profile) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-12 font-sans relative">
      
      {/* SECTION 1: HERO */}
      <section className="flex flex-col gap-6">
        {!isSingle && <h2 className="text-xl font-bold text-white/50">{label} Dashboard</h2>}
        <div className="grid grid-cols-1 md:grid-cols-[45%_55%] gap-6 md:gap-10 items-stretch">
          
          <div className="order-1 md:col-start-2 md:row-start-1 w-full">
            <DriverConductorCard m={profile} label={label} color={color} />
          </div>

          {/* LEFT: 45% Width (Desktop) */}
          <div className="order-2 md:col-start-1 md:row-start-1 md:row-span-2 flex flex-col items-center justify-center gap-6 p-4 md:p-6 rounded-3xl h-full">
            <div className="w-full flex justify-center">
              <LoShuGrid 
                counts={profile.counts || {}} 
                color={color} 
                onCellHover={handleCellHover}
                onCellClick={handleCellClick}
              />
            </div>
            
            <div className="flex justify-between items-center w-full max-w-[280px] bg-black/20 px-6 py-4 rounded-xl border border-white/5">
              <div className="text-center flex-1">
                <div className="text-[10px] text-white/40 mb-1 font-bold tracking-wider uppercase">Missing</div>
                <div className="text-[15px] font-bold text-red-400">
                  {profile.missing?.length ? profile.missing.join(" ") : "—"}
                </div>
              </div>
              <div className="w-[1px] h-8 bg-white/10 mx-2" />
              <div className="text-center flex-1">
                <div className="text-[10px] text-white/40 mb-1 font-bold tracking-wider uppercase">Strong</div>
                <div className="text-[15px] font-bold text-white" style={{ textShadow: `0 0 10px ${color}` }}>
                  {profile.repeated?.length ? profile.repeated.join(" ") : "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="order-3 md:col-start-2 md:row-start-2 flex flex-col gap-6 w-full">
            <div className="w-full bg-black/10 rounded-2xl">
              <PlaneBar planes={profile.planes} />
            </div>
            <div className="w-full bg-black/10 rounded-2xl">
              <ArrowsPanel arrows={profile.arrows} />
            </div>
          </div>
          
        </div>

        {/* Inline insight strip */}
        <div className="w-full bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-200 p-4 rounded-xl text-center text-sm md:text-base font-medium">
          {selectedNumber 
            ? `Highlighting insights for Number ${selectedNumber}` 
            : `A balanced grid indicates a harmonized approach to life's challenges.`}
        </div>
      </section>

      {/* SECTION 2: INSIGHTS */}
      <section className="flex flex-col gap-8">
        <ComplementaryCard missing={profile.missing} present={profile.present} label={label} />
        {narrative && narrative.sections && (
          <NarrativeCard 
            sections={narrative.sections} 
            isGenerating={false} 
            onGenerate={() => console.log('Generate AI Insights clicked')} 
          />
        )}
      </section>

      {/* SECTION 3: ACTION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PlanetDayCard 
          driver={profile.driver} 
          conductor={profile.conductor} 
          driverPlanet={profile.rulingPlanet?.name} 
          conductorPlanet={profile.conductorPlanet?.name} 
          label={label} 
        />
        <RemediesCard remedies={profile.remedies || []} label={label} />
      </section>

      {/* SECTION 4: TIMELINE */}
      <section className="w-full flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <PersonalYearCard personalYear={profile.personalYear} label={label} />
        </div>
        <div className="flex-1">
          <HealthCard health={profile.healthProfile} age={profile.age} label={label} />
        </div>
      </section>

      {/* SECTION 5: INTERACTIVE */}
      {chatProps && (
        <section className="fixed bottom-6 right-6 z-50">
          <ChatPanel 
             chartContext={chatProps.chartContext} 
             lang={chatProps.lang} 
             fetchFollowUp={chatProps.fetchFollowUp} 
          />
        </section>
      )}

    </div>
  );
});
