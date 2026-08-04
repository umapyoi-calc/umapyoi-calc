import { useMemo, useState } from 'react'

type StatKey = 'speed' | 'stamina' | 'power' | 'guts' | 'wit'
type SparkValue = '0' | '1' | '2' | '3'
type MemberKey = 'p1' | 'gp1' | 'gp2' | 'p2' | 'gp3' | 'gp4'

interface SparkStats {
  speed: SparkValue
  stamina: SparkValue
  power: SparkValue
  guts: SparkValue
  wit: SparkValue
}

interface SparkMember {
  key: MemberKey
  label: string
  badge?: string
  cardClass: string
  badgeClass: string
  selectBorderClass: string
}

const statKeys: StatKey[] = ['speed', 'stamina', 'power', 'guts', 'wit']
const statLabels: Record<StatKey, string> = {
  speed: 'Speed',
  stamina: 'Stamina',
  power: 'Power',
  guts: 'Guts',
  wit: 'Wit',
}

const sparkPoints: Record<SparkValue, number> = {
  '0': 0,
  '1': 5,
  '2': 12,
  '3': 21,
}

const baseStats: SparkStats = {
  speed: '0',
  stamina: '0',
  power: '0',
  guts: '0',
  wit: '0',
}

const initialState: Record<MemberKey, SparkStats> = {
  p1: { ...baseStats },
  gp1: { ...baseStats },
  gp2: { ...baseStats },
  p2: { ...baseStats },
  gp3: { ...baseStats },
  gp4: { ...baseStats },
}

const members: SparkMember[] = [
  {
    key: 'p1',
    label: 'Parent 1 Sparks',
    badge: 'Primary',
    cardClass: 'border-[#1393fb]/90',
    badgeClass: 'border-[#1393fb]/90 bg-[#1393fb]/60',
    selectBorderClass: 'border-sky-300',
  },
  {
    key: 'gp1',
    label: 'Grandparent 1 Sparks',
    cardClass: 'border-[#1162a5]/40',
    badgeClass: 'border-[#1162a5]/50 bg-[#1162a5]/40',
    selectBorderClass: 'border-sky-300',
  },
  {
    key: 'gp2',
    label: 'Grandparent 2 Sparks',
    cardClass: 'border-[#1393fb]/40',
    badgeClass: 'border-[#1393fb]/50 bg-[#1393fb]/30',
    selectBorderClass: 'border-sky-300',
  },
  {
    key: 'p2',
    label: 'Parent 2 Sparks',
    badge: 'Primary',
    cardClass: 'border-[#e316c8]/90',
    badgeClass: 'border-[#e316c8]/90 bg-[#e316c8]/60',
    selectBorderClass: 'border-pink-300',
  },
  {
    key: 'gp3',
    label: 'Grandparent 3 Sparks',
    cardClass: 'border-[#93227f]/40',
    badgeClass: 'border-[#93227f]/50 bg-[#93227f]/30',
    selectBorderClass: 'border-pink-300',
  },
  {
    key: 'gp4',
    label: 'Grandparent 4 Sparks',
    cardClass: 'border-[#e316c8]/40',
    badgeClass: 'border-[#e316c8]/50 bg-[#e316c8]/30',
    selectBorderClass: 'border-pink-300',
  },
]

const leftColumnKeys: MemberKey[] = ['p1', 'gp1', 'gp2']
const rightColumnKeys: MemberKey[] = ['p2', 'gp3', 'gp4']

const InheritanceCalPage = () => {
  const [sparkState, setSparkState] = useState<Record<MemberKey, SparkStats>>(initialState)

  const updateSpark = (memberKey: MemberKey, stat: StatKey, value: SparkValue) => {
    setSparkState((prev) => ({
      ...prev,
      [memberKey]: {
        ...prev[memberKey],
        [stat]: value,
      },
    }))
  }

  const statTotals = useMemo(() => {
    const totals: Record<StatKey, number> = {
      speed: 0,
      stamina: 0,
      power: 0,
      guts: 0,
      wit: 0,
    }

    for (const memberStats of Object.values(sparkState)) {
      for (const stat of statKeys) {
        totals[stat] += sparkPoints[memberStats[stat]]
      }
    }

    return totals
  }, [sparkState])

  const totalStats = useMemo(
    () => Object.values(statTotals).reduce((total, value) => total + value, 0),
    [statTotals],
  )

  const renderSparkCard = (memberKey: MemberKey) => {
    const member = members.find((entry) => entry.key === memberKey)
    if (!member) {
      return null
    }

    return (
      <div
        key={member.key}
        className={`relative z-10 w-full bg-white/5 border rounded-2xl p-3 backdrop-blur-xl shadow-2xl ${member.cardClass}`}
      >
        <h2 className="text-white text-xl md:text-2xl font-bold tracking-wide border-b border-white/10 pb-3 mb-4 flex items-center justify-between gap-2">
          {member.label}
          {member.badge ? (
            <span className={`text-xs border-2 rounded-full px-2 py-0.5 ${member.badgeClass}`}>
              {member.badge}
            </span>
          ) : null}
        </h2>

        <div className="grid grid-cols-5 gap-2">
          {statKeys.map((stat) => (
            <div key={`${member.key}-${stat}`} className="text-center">
              <label className="text-xs text-white block mb-1 capitalize">{statLabels[stat]}</label>
              <select
                className={`w-full px-2 py-1 border rounded text-sm text-white bg-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent ${member.selectBorderClass}`}
                value={sparkState[member.key][stat]}
                onChange={(event) => updateSpark(member.key, stat, event.target.value as SparkValue)}
              >
                <option value="0">-</option>
                <option value="1">1 star</option>
                <option value="2">2 stars</option>
                <option value="3">3 stars</option>
              </select>
              <p className="text-xs mt-1 font-medium text-white">+{sparkPoints[sparkState[member.key][stat]]}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden pt-28 pb-10 px-4">
      <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[900px] bg-[#1393fb] rounded-full blur-[260px] opacity-20"></div>
      <div className="absolute top-1/2 left-[70%] -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[900px] bg-[#e316c8] rounded-full blur-[260px] opacity-15"></div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold mb-3 text-white">Legacy Inheritance Spark Calculator</h1>
          <p className="text-base md:text-lg font-semibold text-gray-400">
            Calculate the exact stats bonus from legacy for your Uma
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
            <div className="space-y-4">{leftColumnKeys.map((memberKey) => renderSparkCard(memberKey))}</div>
            <div className="space-y-4">{rightColumnKeys.map((memberKey) => renderSparkCard(memberKey))}</div>
          </div>

          <aside className="bg-white/10 border border-white/20 rounded-2xl backdrop-blur-xl p-5 text-white h-fit shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Total Inheritance Bonus</h2>
            <p className="text-sm text-gray-200 mb-5">Scoring rule: 1 star = 5, 2 stars = 12, 3 stars = 21</p>

            <div className="space-y-2">
              {statKeys.map((stat) => (
                <div key={`total-${stat}`} className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span>{statLabels[stat]}</span>
                  <span className="font-bold">+{statTotals[stat]}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-black/30 border border-white/10 p-4">
              <p className="text-sm text-gray-200">Combined Total</p>
              <p className="text-4xl font-bold mt-1">+{totalStats}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default InheritanceCalPage