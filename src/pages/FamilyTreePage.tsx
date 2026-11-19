import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GitBranch,
  Search,
  User,
  Users,
  X,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { FamilyMember } from '../types/archive';
import { PageHeader } from '../components/PageHeader';

interface TreeNodeProps {
  member: FamilyMember;
  allMembers: FamilyMember[];
  childrenMap: Map<string, FamilyMember[]>;
  memberMap: Map<string, FamilyMember>;
  collapsedIds: Set<string>;
  toggleCollapse: (id: string) => void;
  onSelect: (member: FamilyMember) => void;
  selectedId?: string;
  depth?: number;
}

function PedigreeNode({
  member,
  allMembers,
  childrenMap,
  memberMap,
  collapsedIds,
  toggleCollapse,
  onSelect,
  selectedId,
  depth = 0,
}: TreeNodeProps) {
  const { t } = useArchive();
  const children = childrenMap.get(member.id) ?? [];
  const isCollapsed = collapsedIds.has(member.id);
  const spouse = member.spouseId ? memberMap.get(member.spouseId) : undefined;
  const isSelected = selectedId === member.id;

  return (
    <div className="relative">
      <div className="flex items-start gap-2">
        {children.length > 0 ? (
          <button
            type="button"
            onClick={() => toggleCollapse(member.id)}
            className="mt-3 p-1 rounded border border-[#D8CBB0] bg-white hover:bg-[#F3ECE0] text-[#6B1D2F] shrink-0"
            aria-label={isCollapsed ? t('Expand branch', 'शाखा खोलें') : t('Collapse branch', 'शाखा समेटें')}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        ) : (
          <div className="w-6 shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch gap-3">
            <button
              type="button"
              onClick={() => onSelect(member)}
              className={`text-left w-full sm:w-auto sm:min-w-[240px] sm:max-w-sm bg-white border rounded-xl p-4 transition-all ${
                isSelected
                  ? 'border-[#6E182B] ring-2 ring-[#6E182B]/20 shadow-sm'
                  : 'border-[#E2D9C8] hover:border-[#A67C2E]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs text-[#5C554E] mb-1">
                <span className="font-semibold text-[#6E182B] tabular-nums">
                  {t(`Gen ${member.generation}`, `पीढ़ी ${member.generation}`)}
                </span>
                <span>
                  {member.isDemoData
                    ? t('DEMO DATA', 'नमूना')
                    : member.isVerified
                    ? t('Verified', 'सत्यापित')
                    : t('Pending', 'असत्यापित')}
                </span>
              </div>
              <div className="flex items-start gap-3">
                {member.photoUrl && (
                  <img
                    src={member.photoUrl}
                    alt={t(member.fullName, member.fullNameHi)}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-lg object-cover object-top border border-[#D8CBB0] shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-serif text-lg font-semibold text-[#191614] leading-snug">
                    {t(member.fullName, member.fullNameHi)}
                  </p>
                  <p className="text-xs text-[#5C554E] mt-1">
                    {member.city ? `${member.city}${member.country ? `, ${member.country}` : ''}` : member.nativeVillage}
                    {member.birthYear ? ` · ${member.birthYear}${member.deathYear ? `–${member.deathYear}` : ''}` : ''}
                  </p>
                </div>
              </div>
              {member.profession && (
                <p className="text-xs text-[#173F30] mt-2 line-clamp-1">{member.profession}</p>
              )}
            </button>

            {(spouse || member.spouseName) && (
              <button
                type="button"
                onClick={() => (spouse ? onSelect(spouse) : onSelect(member))}
                className="text-left w-full sm:w-auto sm:min-w-[200px] sm:max-w-xs bg-[#F2ECE1]/80 border border-dashed border-[#D8CBB0] rounded-xl p-4 hover:border-[#A67C2E] transition-colors"
              >
                <p className="text-xs text-[#A67C2E] font-medium mb-1">
                  {t('Spouse', 'जीवनसाथी')}
                </p>
                <p className="font-serif text-base font-semibold text-[#191614]">
                  {spouse ? t(spouse.fullName, spouse.fullNameHi) : member.spouseName}
                </p>
                {spouse?.city && (
                  <p className="text-xs text-[#5C554E] mt-1">{spouse.city}</p>
                )}
              </button>
            )}
          </div>

          {children.length > 0 && !isCollapsed && depth < 12 && (
            <div className="mt-3 ml-1.5 pl-3 sm:ml-3 sm:pl-5 border-l border-[#D8CBB0] space-y-3">
              {children.map((child) => (
                <PedigreeNode
                  key={child.id}
                  member={child}
                  allMembers={allMembers}
                  childrenMap={childrenMap}
                  memberMap={memberMap}
                  collapsedIds={collapsedIds}
                  toggleCollapse={toggleCollapse}
                  onSelect={onSelect}
                  selectedId={selectedId}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FamilyTreePage() {
  const { t, members, branches } = useArchive();
  const [searchParams] = useSearchParams();
  const initialBranch = searchParams.get('branch') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState(initialBranch);
  const [generationFilter, setGenerationFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'pedigree' | 'generations'>('pedigree');
  const [collapsedGenSet, setCollapsedGenSet] = useState<Set<number>>(new Set());
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const memberMap = useMemo(() => {
    const map = new Map<string, FamilyMember>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  const branchMap = useMemo(() => {
    const map = new Map<string, string>();
    branches.forEach((b) => map.set(b.id, t(b.name, b.nameHi)));
    return map;
  }, [branches, t]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return members.filter((m) => {
      if (branchFilter !== 'all' && m.branchId !== branchFilter) return false;
      if (generationFilter !== 'all' && String(m.generation) !== generationFilter) return false;
      if (q) {
        const hay = `${m.fullName} ${m.fullNameHi} ${m.city ?? ''} ${m.profession ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [members, branchFilter, generationFilter, searchQuery]);

  const childrenMap = useMemo(() => {
    const map = new Map<string, FamilyMember[]>();
    members.forEach((m) => {
      const father = m.fatherId ? memberMap.get(m.fatherId) : undefined;
      const mother = m.motherId ? memberMap.get(m.motherId) : undefined;
      const fatherHasLineage = Boolean(father && (father.fatherId || father.motherId));
      const motherHasLineage = Boolean(mother && (mother.fatherId || mother.motherId));

      let anchorParentId: string | undefined;
      if (mother && motherHasLineage && !fatherHasLineage) {
        anchorParentId = mother.id;
      } else if (father) {
        anchorParentId = father.id;
      } else if (mother) {
        anchorParentId = mother.id;
      }

      if (anchorParentId) {
        const list = map.get(anchorParentId) ?? [];
        list.push(m);
        map.set(anchorParentId, list);
      }
    });
    return map;
  }, [members, memberMap]);

  const rootNodes = useMemo(() => {
    const filteredIds = new Set(filteredMembers.map((m) => m.id));
    // Roots: members whose father/mother isn't in filtered list (and avoid duplicating spouses attached to another node in the tree)
    return filteredMembers
      .filter((m) => {
        const hasParentInSet =
          (m.fatherId && filteredIds.has(m.fatherId)) ||
          (m.motherId && filteredIds.has(m.motherId));
        if (hasParentInSet) return false;
        if (m.spouseId && filteredIds.has(m.spouseId)) {
          const spouse = memberMap.get(m.spouseId);
          if (spouse) {
            const spouseHasParentInSet =
              (spouse.fatherId && filteredIds.has(spouse.fatherId)) ||
              (spouse.motherId && filteredIds.has(spouse.motherId));
            if (spouseHasParentInSet) return false;
            const selfHasLineage = Boolean(m.fatherId || m.motherId);
            const spouseHasLineage = Boolean(spouse.fatherId || spouse.motherId);
            if (!selfHasLineage && spouseHasLineage) return false;
            if (selfHasLineage === spouseHasLineage && m.gender === 'female' && spouse.generation === m.generation) {
              return false;
            }
          }
        }
        return true;
      })
      .sort((a, b) => a.generation - b.generation);
  }, [filteredMembers, memberMap]);

  const generationsList = useMemo(() => {
    const grouped = new Map<number, FamilyMember[]>();
    filteredMembers.forEach((m) => {
      const list = grouped.get(m.generation) ?? [];
      list.push(m);
      grouped.set(m.generation, list);
    });
    return Array.from(grouped.entries()).sort((a, b) => a[0] - b[0]);
  }, [filteredMembers]);

  const allGenerations = useMemo(() => {
    const set = new Set<number>();
    members.forEach((m) => set.add(m.generation));
    return Array.from(set).sort((a, b) => a - b);
  }, [members]);

  const toggleNodeCollapse = (id: string) => {
    setCollapsedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGenCollapse = (gen: number) => {
    setCollapsedGenSet((prev) => {
      const next = new Set(prev);
      if (next.has(gen)) next.delete(gen);
      else next.add(gen);
      return next;
    });
  };

  // Compute relatives for Inspector Drawer
  const inspectorRelatives = useMemo(() => {
    if (!selectedMember) return null;
    const father = selectedMember.fatherId ? memberMap.get(selectedMember.fatherId) : undefined;
    const mother = selectedMember.motherId ? memberMap.get(selectedMember.motherId) : undefined;
    const spouse = selectedMember.spouseId ? memberMap.get(selectedMember.spouseId) : undefined;
    const children = members.filter(
      (m) => m.fatherId === selectedMember.id || m.motherId === selectedMember.id,
    );
    const childIds = new Set(children.map((c) => c.id));
    const grandchildren = members.filter(
      (m) => (m.fatherId && childIds.has(m.fatherId)) || (m.motherId && childIds.has(m.motherId)),
    );
    const siblings = members.filter(
      (m) =>
        m.id !== selectedMember.id &&
        ((selectedMember.fatherId && m.fatherId === selectedMember.fatherId) ||
          (selectedMember.motherId && m.motherId === selectedMember.motherId)),
    );
    return { father, mother, spouse, children, grandchildren, siblings };
  }, [selectedMember, members, memberMap]);

  return (
    <div>
      <PageHeader
        kickerEn="Vanshavali · Interactive Lineage"
        kickerHi="पारिवारिक वंशावली"
        titleEn="Multi-Generation Family Tree"
        titleHi="केरापा परिवार वंशावली"
        subtitleEn="Explore great-grandparents, grandparents, parents, siblings, spouses, and descendants across every branch. Click any member to inspect relationships."
        subtitleHi="प्रथम पीढ़ी से वर्तमान पीढ़ी तक पूर्वजों, भाई-बहनों, जीवनसाथी और संतानों के संबंधों का संवादात्मक वृक्ष।"
        isDemo={members.some((m) => m.isDemoData)}
      />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Controls Toolbar */}
        <div className="bg-white border border-[#E5DEC9] rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-4 h-4 text-[#57534E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search member name or city...', 'नाम या शहर से खोजें...')}
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#FBF8F3] border border-[#D8CBB0] rounded-lg focus:outline-none focus:border-[#6B1D2F]"
              />
            </div>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              aria-label={t('Filter by family branch', 'शाखा के अनुसार फ़िल्टर')}
              className="px-3 py-2 text-sm bg-[#FBF8F3] border border-[#D8CBB0] rounded-lg focus:outline-none focus:border-[#6B1D2F]"
            >
              <option value="all">{t('All Family Branches', 'सभी परिवार शाखाएँ')}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {t(b.name, b.nameHi)}
                </option>
              ))}
            </select>

            <select
              value={generationFilter}
              onChange={(e) => setGenerationFilter(e.target.value)}
              aria-label={t('Filter by generation', 'पीढ़ी के अनुसार फ़िल्टर')}
              className="px-3 py-2 text-sm bg-[#FBF8F3] border border-[#D8CBB0] rounded-lg focus:outline-none focus:border-[#6B1D2F]"
            >
              <option value="all">{t('All Generations', 'सभी पीढ़ियां')}</option>
              {allGenerations.map((g) => (
                <option key={g} value={String(g)}>
                  {t(`Generation ${g}`, `पीढ़ी ${g}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="inline-flex p-1 bg-[#F3ECE0] rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('pedigree')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  viewMode === 'pedigree' ? 'bg-white text-[#6B1D2F] shadow-xs' : 'text-[#57534E]'
                }`}
              >
                {t('Pedigree Tree', 'वंश वृक्ष')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('generations')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  viewMode === 'generations' ? 'bg-white text-[#6B1D2F] shadow-xs' : 'text-[#57534E]'
                }`}
              >
                {t('By Generation', 'पीढ़ी अनुसार')}
              </button>
            </div>
          </div>
        </div>

        {/* Main Tree Canvas */}
        {filteredMembers.length === 0 ? (
          <div className="bg-white border border-[#E5DEC9] rounded-xl p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-[#B6862D] mx-auto" />
            <p className="font-serif text-xl text-[#1C1917]">
              {t('No matching family members found', 'कोई मेल खाता सदस्य नहीं मिला')}
            </p>
            <p className="text-sm text-[#57534E]">
              {t('Adjust search filters or add members in the directory.', 'खोज फ़िल्टर बदलें या नया सदस्य जोड़ें।')}
            </p>
          </div>
        ) : viewMode === 'pedigree' ? (
          <div className="bg-[#F4EFE6]/45 border border-[#E5DEC9] rounded-xl p-6 space-y-6 overflow-x-auto">
            {rootNodes.map((root) => (
              <PedigreeNode
                key={root.id}
                member={root}
                allMembers={members}
                childrenMap={childrenMap}
                memberMap={memberMap}
                collapsedIds={collapsedNodeIds}
                toggleCollapse={toggleNodeCollapse}
                onSelect={setSelectedMember}
                selectedId={selectedMember?.id}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {generationsList.map(([gen, genMembers]) => {
              const isCollapsed = collapsedGenSet.has(gen);
              return (
                <div key={gen} className="bg-white border border-[#E5DEC9] rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleGenCollapse(gen)}
                    className="w-full px-6 py-4 bg-[#F4EFE6]/70 flex items-center justify-between text-left hover:bg-[#F3ECE0] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <GitBranch className="w-4 h-4 text-[#6B1D2F]" />
                      <span className="font-serif text-xl font-semibold text-[#1C1917]">
                        {t(`Generation ${gen}`, `पीढ़ी ${gen}`)}
                      </span>
                      <span className="text-xs text-[#57534E] tabular-nums">
                        · {genMembers.length} {t('members', 'सदस्य')}
                      </span>
                    </div>
                    {isCollapsed ? (
                      <ChevronRight className="w-5 h-5 text-[#57534E]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#57534E]" />
                    )}
                  </button>
                  {!isCollapsed && (
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {genMembers.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMember(m)}
                          className={`text-left p-4 rounded-xl border transition-colors ${
                            selectedMember?.id === m.id
                              ? 'border-[#6B1D2F] bg-[#6B1D2F]/5'
                              : 'border-[#E5DEC9] bg-[#FBF8F3]/60 hover:border-[#B6862D]'
                          }`}
                        >
                          <p className="text-xs text-[#6B1D2F] font-medium mb-1">
                            {branchMap.get(m.branchId) || m.branchId}
                          </p>
                          <p className="font-serif text-lg font-semibold text-[#1C1917]">
                            {t(m.fullName, m.fullNameHi)}
                          </p>
                          {(m.fatherName || m.spouseName) && (
                            <p className="text-xs text-[#57534E] mt-1.5 line-clamp-1">
                              {m.fatherName ? `${t('S/o / D/o', 'पुत्र/पुत्री')}: ${m.fatherName}` : ''}
                              {m.fatherName && m.spouseName ? ' · ' : ''}
                              {m.spouseName ? `${t('Spouse', 'जीवनसाथी')}: ${m.spouseName}` : ''}
                            </p>
                          )}
                          <p className="text-xs text-[#57534E] mt-1">
                            {m.city ? `${m.city}, ${m.country || 'India'}` : m.nativeVillage}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Member Relationship Inspector Modal / Drawer */}
      {selectedMember && inspectorRelatives && (
        <div className="fixed inset-0 z-50 bg-black/45 flex justify-end">
          <div className="w-full max-w-lg bg-[#FBF8F3] h-full overflow-y-auto border-l border-[#E5DEC9] p-6 md:p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-[#E5DEC9] pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-[#6B1D2F] font-semibold">
                    {t(`Generation ${selectedMember.generation}`, `पीढ़ी ${selectedMember.generation}`)}
                    {' · '}
                    {branchMap.get(selectedMember.branchId) || selectedMember.branchId}
                  </p>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1C1917] mt-1">
                    {t(selectedMember.fullName, selectedMember.fullNameHi)}
                  </h2>
                  <p className="text-sm text-[#57534E] mt-1">
                    {selectedMember.birthYear || t('Birth year unknown', 'जन्म वर्ष अज्ञात')}
                    {selectedMember.deathYear ? ` – ${selectedMember.deathYear}` : ''}
                    {' · '}
                    {selectedMember.city ? `${selectedMember.city}, ${selectedMember.country || 'India'}` : selectedMember.nativeVillage}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="p-2 rounded-lg border border-[#E5DEC9] bg-white hover:bg-[#F3ECE0]"
                  aria-label={t('Close inspector', 'बंद करें')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {(selectedMember.bio || selectedMember.bioHi) && (
                <p className="text-sm text-[#44403C] leading-relaxed">
                  {t(selectedMember.bio || '', selectedMember.bioHi || '')}
                </p>
              )}

              {/* Visual Relationship Links */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-[0.16em] text-[#B6862D] font-semibold">
                  {t('Family Relationships', 'पारिवारिक संबंध')}
                </h3>

                <div className="bg-white border border-[#E5DEC9] rounded-xl divide-y divide-[#E5DEC9] text-sm">
                  <div className="p-3.5 flex items-center justify-between gap-3">
                    <span className="text-[#57534E]">{t('Father', 'पिता')}</span>
                    {inspectorRelatives.father ? (
                      <button
                        type="button"
                        onClick={() => setSelectedMember(inspectorRelatives.father!)}
                        className="font-medium text-[#6B1D2F] hover:underline text-right"
                      >
                        {t(inspectorRelatives.father.fullName, inspectorRelatives.father.fullNameHi)}
                      </button>
                    ) : (
                      <span className="text-[#1C1917] text-right">
                        {selectedMember.fatherName || t('Not recorded', 'दर्ज नहीं')}
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 flex items-center justify-between gap-3">
                    <span className="text-[#57534E]">{t('Mother', 'माता')}</span>
                    {inspectorRelatives.mother ? (
                      <button
                        type="button"
                        onClick={() => setSelectedMember(inspectorRelatives.mother!)}
                        className="font-medium text-[#6B1D2F] hover:underline text-right"
                      >
                        {t(inspectorRelatives.mother.fullName, inspectorRelatives.mother.fullNameHi)}
                      </button>
                    ) : (
                      <span className="text-[#1C1917] text-right">
                        {selectedMember.motherName || t('Not recorded', 'दर्ज नहीं')}
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 flex items-center justify-between gap-3">
                    <span className="text-[#57534E]">{t('Spouse', 'जीवनसाथी')}</span>
                    {inspectorRelatives.spouse ? (
                      <button
                        type="button"
                        onClick={() => setSelectedMember(inspectorRelatives.spouse!)}
                        className="font-medium text-[#6B1D2F] hover:underline text-right"
                      >
                        {t(inspectorRelatives.spouse.fullName, inspectorRelatives.spouse.fullNameHi)}
                      </button>
                    ) : (
                      <span className="text-[#1C1917] text-right">
                        {selectedMember.spouseName || t('Not recorded', 'दर्ज नहीं')}
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 space-y-1.5">
                    <span className="text-[#57534E] block">{t('Siblings', 'भाई-बहन')}</span>
                    {inspectorRelatives.siblings.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {inspectorRelatives.siblings.map((sib) => (
                          <button
                            key={sib.id}
                            type="button"
                            onClick={() => setSelectedMember(sib)}
                            className="text-xs px-2.5 py-1 bg-[#F4EFE6] border border-[#E5DEC9] rounded-md text-[#6B1D2F] hover:bg-[#EAE0CE]"
                          >
                            {t(sib.fullName, sib.fullNameHi)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-[#78716C]">{t('None linked', 'कोई दर्ज नहीं')}</span>
                    )}
                  </div>

                  <div className="p-3.5 space-y-1.5">
                    <span className="text-[#57534E] block">{t('Children', 'संतान')}</span>
                    {inspectorRelatives.children.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {inspectorRelatives.children.map((ch) => (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => setSelectedMember(ch)}
                            className="text-xs px-2.5 py-1 bg-[#F4EFE6] border border-[#E5DEC9] rounded-md text-[#1B4332] hover:bg-[#EAE0CE]"
                          >
                            {t(ch.fullName, ch.fullNameHi)}
                          </button>
                        ))}
                      </div>
                    ) : selectedMember.childrenNames && selectedMember.childrenNames.length > 0 ? (
                      <p className="text-xs text-[#1C1917]">{selectedMember.childrenNames.join(', ')}</p>
                    ) : (
                      <span className="text-xs text-[#78716C]">{t('None recorded', 'कोई दर्ज नहीं')}</span>
                    )}
                  </div>

                  {inspectorRelatives.grandchildren.length > 0 && (
                    <div className="p-3.5 space-y-1.5">
                      <span className="text-[#57534E] block">{t('Grandchildren', 'पौत्र / दौहित्र')}</span>
                      <div className="flex flex-wrap gap-2">
                        {inspectorRelatives.grandchildren.map((gc) => (
                          <button
                            key={gc.id}
                            type="button"
                            onClick={() => setSelectedMember(gc)}
                            className="text-xs px-2.5 py-1 bg-[#F4EFE6] border border-[#E5DEC9] rounded-md text-[#1C1917] hover:bg-[#EAE0CE]"
                          >
                            {t(gc.fullName, gc.fullNameHi)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E5DEC9] mt-6 flex items-center justify-between gap-3">
              <Link
                to={`/members/${selectedMember.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg hover:bg-[#4E1220] transition-colors"
              >
                <User className="w-4 h-4" />
                <span>{t('Open Full Profile', 'पूर्ण परिचय देखें')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2.5 text-sm text-[#57534E] hover:text-[#1C1917]"
              >
                {t('Close', 'बंद करें')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
