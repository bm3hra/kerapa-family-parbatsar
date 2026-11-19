import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, MapPin, ShieldCheck } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { FamilyMember } from '../types/archive';
import { PageHeader } from '../components/PageHeader';

interface CityCoord {
  key: string;
  label: string;
  region: 'rajasthan' | 'india' | 'global';
  x: number;
  y: number;
}

const KNOWN_COORDS: CityCoord[] = [
  // Rajasthan view (percentage coords on stylized Rajasthan canvas)
  { key: 'parbatsar', label: 'Parbatsar (Didwana-Kuchaman)', region: 'rajasthan', x: 52, y: 46 },
  { key: 'makrana', label: 'Makrana', region: 'rajasthan', x: 56, y: 37 },
  { key: 'degana', label: 'Degana', region: 'rajasthan', x: 45, y: 42 },
  { key: 'manpura', label: 'Manpura (Ajmer)', region: 'rajasthan', x: 55, y: 63 },
  { key: 'roopangarh', label: 'Roopangarh (Ajmer)', region: 'rajasthan', x: 53, y: 52 },
  { key: 'paner', label: 'Paner (Ajmer)', region: 'rajasthan', x: 56, y: 55 },
  { key: 'nagaur', label: 'Nagaur', region: 'rajasthan', x: 38, y: 36 },
  { key: 'jaipur', label: 'Jaipur', region: 'rajasthan', x: 71, y: 44 },
  { key: 'ajmer', label: 'Ajmer', region: 'rajasthan', x: 48, y: 58 },
  { key: 'jodhpur', label: 'Jodhpur', region: 'rajasthan', x: 32, y: 56 },
  { key: 'udaipur', label: 'Udaipur', region: 'rajasthan', x: 44, y: 80 },
  { key: 'bikaner', label: 'Bikaner', region: 'rajasthan', x: 38, y: 22 },

  // India view
  { key: 'new delhi', label: 'New Delhi', region: 'india', x: 42, y: 28 },
  { key: 'parbatsar_in', label: 'Parbatsar / Rajasthan', region: 'india', x: 31, y: 39 },
  { key: 'ahmedabad', label: 'Ahmedabad', region: 'india', x: 26, y: 51 },
  { key: 'mumbai', label: 'Mumbai', region: 'india', x: 29, y: 63 },
  { key: 'bengaluru', label: 'Bengaluru', region: 'india', x: 43, y: 78 },
  { key: 'kolkata', label: 'Kolkata', region: 'india', x: 69, y: 47 },

  // Global view
  { key: 'india', label: 'India (Parbatsar & Cities)', region: 'global', x: 67, y: 47 },
  { key: 'uae', label: 'UAE (Dubai)', region: 'global', x: 58, y: 45 },
  { key: 'united kingdom', label: 'United Kingdom (London)', region: 'global', x: 46, y: 25 },
  { key: 'united states', label: 'United States', region: 'global', x: 22, y: 34 },
  { key: 'singapore', label: 'Singapore', region: 'global', x: 76, y: 59 },
];

export function ResidenceMapPage() {
  const { t, members } = useArchive();
  const [regionTab, setRegionTab] = useState<'rajasthan' | 'india' | 'global'>('rajasthan');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const cityGroups = useMemo(() => {
    const map = new Map<string, { city: string; state: string; country: string; members: FamilyMember[] }>();
    members.forEach((m) => {
      const cityName = m.city?.trim() || m.nativeVillage;
      if (!cityName) return;
      const key = cityName.toLowerCase();
      const entry = map.get(key) || {
        city: cityName,
        state: m.state || '',
        country: m.country || 'India',
        members: [],
      };
      entry.members.push(m);
      map.set(key, entry);
    });
    return Array.from(map.values()).sort((a, b) => b.members.length - a.members.length);
  }, [members]);

  const activePins = useMemo(() => {
    return KNOWN_COORDS.filter((c) => c.region === regionTab).map((coord) => {
      const matching = members.filter((m) => {
        const cityLow = (m.city || m.nativeVillage || '').toLowerCase();
        const countryLow = (m.country || 'india').toLowerCase();
        if (regionTab === 'global') {
          if (coord.key === 'india') return countryLow === 'india';
          if (coord.key === 'uae') return countryLow === 'uae' || cityLow === 'dubai';
          return countryLow === coord.key || cityLow === coord.key;
        }
        if (coord.key === 'parbatsar_in') {
          return (m.state || '').toLowerCase() === 'rajasthan' || cityLow === 'parbatsar';
        }
        return cityLow === coord.key;
      });
      return { ...coord, count: matching.length, members: matching };
    });
  }, [regionTab, members]);

  const displayedMembers = useMemo(() => {
    if (selectedCity === 'all') return members;
    return members.filter((m) => {
      const cityLow = (m.city || m.nativeVillage || '').toLowerCase();
      const countryLow = (m.country || 'india').toLowerCase();
      return cityLow === selectedCity.toLowerCase() || countryLow === selectedCity.toLowerCase();
    });
  }, [members, selectedCity]);

  return (
    <div>
      <PageHeader
        kickerEn="Residence Network · Geography"
        kickerHi="निवास एवं परिवार नेटवर्क"
        titleEn="Current Residence & Family Network"
        titleHi="केरापा परिवार का वर्तमान निवास मानचित्र"
        subtitleEn="City-level residence distribution voluntarily shared by family members across Parbatsar, Rajasthan, India, and worldwide. Exact home addresses are never published."
        subtitleHi="परबतसर, राजस्थान, भारत और विश्व भर में परिवारजनों के स्वैच्छिक शहर-स्तरीय निवास स्थान। घर का सटीक पता कभी प्रकाशित नहीं किया जाता।"
        isDemo={members.some((m) => m.isDemoData)}
      />

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div className="bg-white border border-[#E5DEC9] rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DEC9] pb-4">
            <div className="flex items-center gap-2 text-sm text-[#1B4332] font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {t(
                  'Privacy Guard Active: Only city and country level locations shown.',
                  'गोपनीयता सुरक्षित: केवल शहर व देश का स्तर प्रदर्शित।',
                )}
              </span>
            </div>

            <div className="inline-flex p-1 bg-[#F3ECE0] rounded-lg">
              {([
                ['rajasthan', t('Rajasthan', 'राजस्थान')],
                ['india', t('India', 'भारत')],
                ['global', t('International', 'अंतर्राष्ट्रीय')],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setRegionTab(key);
                    setSelectedCity('all');
                  }}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    regionTab === key ? 'bg-white text-[#6B1D2F] shadow-xs' : 'text-[#57534E]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Stylized Archival SVG Map */}
            <div className="lg:col-span-7 relative aspect-[16/10] bg-[#F4EFE6] border border-[#D8CBB0] rounded-xl overflow-hidden rajasthani-lattice">
              <svg viewBox="0 0 100 62" className="w-full h-full">
                {/* Decorative map meridian lines */}
                <line x1="0" y1="20" x2="100" y2="20" stroke="#D8CBB0" strokeWidth="0.2" strokeDasharray="1 1" />
                <line x1="0" y1="42" x2="100" y2="42" stroke="#D8CBB0" strokeWidth="0.2" strokeDasharray="1 1" />
                <line x1="33" y1="0" x2="33" y2="62" stroke="#D8CBB0" strokeWidth="0.2" strokeDasharray="1 1" />
                <line x1="66" y1="0" x2="66" y2="62" stroke="#D8CBB0" strokeWidth="0.2" strokeDasharray="1 1" />

                {regionTab === 'rajasthan' && (
                  <path
                    d="M 18 28 L 38 14 L 58 18 L 78 34 L 74 52 L 50 58 L 30 52 L 16 40 Z"
                    fill="#FBF8F3"
                    stroke="#B6862D"
                    strokeWidth="0.45"
                  />
                )}
                {regionTab === 'india' && (
                  <path
                    d="M 38 8 L 52 14 L 58 26 L 76 30 L 72 48 L 54 58 L 42 58 L 28 46 L 22 32 L 32 22 Z"
                    fill="#FBF8F3"
                    stroke="#B6862D"
                    strokeWidth="0.45"
                  />
                )}
                {regionTab === 'global' && (
                  <g fill="#FBF8F3" stroke="#D8CBB0" strokeWidth="0.35">
                    <ellipse cx="22" cy="28" rx="13" ry="11" />
                    <ellipse cx="48" cy="24" rx="10" ry="9" />
                    <ellipse cx="66" cy="30" rx="16" ry="14" />
                    <ellipse cx="80" cy="48" rx="8" ry="6" />
                  </g>
                )}
              </svg>

              {/* Interactive Location Markers */}
              {activePins.map((pin) => {
                const active = selectedCity.toLowerCase() === pin.key || (pin.key === 'parbatsar_in' && selectedCity === 'Parbatsar');
                return (
                  <button
                    key={pin.key}
                    type="button"
                    onClick={() =>
                      setSelectedCity(
                        pin.key === 'parbatsar_in' ? 'Parbatsar' : pin.key,
                      )
                    }
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold tabular-nums border transition-transform group-hover:scale-110 ${
                        pin.count > 0
                          ? active
                            ? 'bg-[#6B1D2F] text-white border-white shadow-md'
                            : 'bg-[#1B4332] text-white border-[#FBF8F3] shadow-sm'
                          : 'bg-white/90 text-[#78716C] border-[#D8CBB0]'
                      }`}
                    >
                      {pin.count}
                    </span>
                    <span className="mt-1 px-1.5 py-0.5 bg-[#FBF8F3]/95 border border-[#E5DEC9] rounded text-[11px] font-medium text-[#1C1917] whitespace-nowrap shadow-xs">
                      {pin.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* City Summary List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                  {t('Shared Cities & Countries', 'साझा किए गए शहर एवं देश')}
                </h2>
                {selectedCity !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCity('all')}
                    className="text-xs font-medium text-[#6B1D2F] hover:underline"
                  >
                    {t('Show All Cities', 'सभी दिखाएं')}
                  </button>
                )}
              </div>

              <div className="divide-y divide-[#E5DEC9] border border-[#E5DEC9] rounded-xl bg-[#FBF8F3]/50 max-h-[340px] overflow-y-auto">
                {cityGroups.map((group) => (
                  <button
                    key={group.city}
                    type="button"
                    onClick={() => setSelectedCity(group.city)}
                    className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                      selectedCity.toLowerCase() === group.city.toLowerCase()
                        ? 'bg-[#6B1D2F]/10'
                        : 'hover:bg-[#F3ECE0]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-[#6B1D2F] shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-[#1C1917]">{group.city}</p>
                        <p className="text-xs text-[#57534E]">
                          {[group.state, group.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#1B4332] tabular-nums">
                      {group.members.length} {t('members', 'सदस्य')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filtered Location Members */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#B6862D]" />
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
              {selectedCity === 'all'
                ? t('All Shared Family Locations', 'सभी साझा किए गए निवास')
                : t(`Members in ${selectedCity}`, `${selectedCity} में निवासरत सदस्य`)}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedMembers.map((m) => (
              <Link
                key={m.id}
                to={`/members/${m.id}`}
                className="bg-white border border-[#E5DEC9] rounded-xl p-4 hover:border-[#B6862D] transition-colors"
              >
                <p className="text-xs text-[#6B1D2F] font-medium">
                  {m.city || m.nativeVillage}, {m.country || 'India'}
                </p>
                <p className="font-serif text-lg font-semibold text-[#1C1917] mt-0.5">
                  {t(m.fullName, m.fullNameHi)}
                </p>
                <p className="text-xs text-[#57534E] mt-1">
                  {t(`Generation ${m.generation}`, `पीढ़ी ${m.generation}`)}
                  {m.profession ? ` · ${m.profession}` : ''}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
