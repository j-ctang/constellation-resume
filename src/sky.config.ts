// All resume content lives here. Edit this file to change the site; components read it generically.

export type Region = 'guild' | 'forge' | 'academy' | 'toolmakers'

export interface SkyField {
  label: string
  value: string
}

export interface SkyLink {
  label: string
  href: string
}

export interface SkyEntry {
  /** kebab-case, unique. Seeds the star layout, so renaming an id reshapes its constellation. */
  id: string
  region: Region
  poeticName: string
  lore: string
  title: string
  org?: string
  /** Optional website for the organisation; links the org name in the story. */
  orgUrl?: string
  dates?: string
  fields: SkyField[]
  bullets: string[]
  /** Optional link shown under the bullets, e.g. a repository. */
  link?: SkyLink
}

export interface RegionInfo {
  id: Region
  name: string
  section: string
}

export interface Profile {
  name: string
  role: string
  bio: string
  links: SkyLink[]
  pdfUrl: string
}

export const REGIONS: RegionInfo[] = [
  { id: 'guild', name: 'The Guild Reaches', section: 'Experience' },
  { id: 'forge', name: 'The Forge', section: 'Projects' },
  { id: 'academy', name: 'The Academy', section: 'Education' },
  { id: 'toolmakers', name: "The Toolmakers' Field", section: 'Skills' },
]

export const PROFILE: Profile = {
  name: 'Justin Tang',
  role: 'Computer Science · UC Irvine',
  bio: 'Second-year CS student building tools for robot learning. San Jose, CA.',
  links: [
    { label: 'GitHub', href: 'https://github.com/j-ctang' },
    { label: 'Email', href: 'mailto:jstn.c.tang@gmail.com' },
  ],
  pdfUrl: `${import.meta.env.BASE_URL}resume.pdf`,
}

export const ENTRIES: SkyEntry[] = [
  {
    id: 'makermods',
    region: 'guild',
    poeticName: 'The Patient Hand',
    lore: 'A hand that learned by watching, and was corrected mid-reach.',
    title: 'Software Engineer Intern',
    org: 'MakerMods',
    orgUrl: 'https://www.makermods.ai',
    dates: 'Jul 2026 – Sep 2026',
    fields: [
      { label: 'Type', value: 'Internship' },
      { label: 'Stack', value: 'Python · React · TypeScript · PyTorch · Hugging Face · LeRobot' },
      { label: 'Scope', value: 'Robot-learning platform across 3 robot arms' },
    ],
    bullets: [
      'Wired LeRobot CLI workflows (calibration, teleoperation, recording, training, deployment) into a no-code web dashboard',
      'Added DAgger-based coaching so users can take over a trained policy mid-rollout and feed corrections back into training',
      'Shipped a Hugging Face Hub–streaming dataset viewer, removing full downloads just to preview data',
      'Built live 3D URDF visualization during teleoperation and cross-arm safety gating across three robot arms',
    ],
    link: { label: 'View repository', href: 'https://github.com/makermods-robotics/makermodslab' },
  },
  {
    id: 'jev-prune',
    region: 'forge',
    poeticName: "The Pruner's Shears",
    lore: 'It trims the dead branches so the living ones reach further.',
    title: 'Jev Prune for Claude Code',
    fields: [
      { label: 'Type', value: 'Local proxy + CLI' },
      { label: 'Stack', value: 'TypeScript · Node.js' },
    ],
    bullets: [
      'Built a local proxy between Claude Code and the Anthropic API that prunes stale tool results from context',
      'Prunes automatically near 120K tokens, only between tasks, and passes requests through unchanged if the pruning service is down',
      'Shipped a CLI with stats, doctor, and self-update commands, plus multi-terminal support with crash restart',
    ],
    link: { label: 'View repository', href: 'https://github.com/j-ctang/claude-code-jev-prune' },
  },
  {
    id: 'tab-tamer',
    region: 'forge',
    poeticName: 'The Shepherd',
    lore: 'Every stray tab counted and brought home before dusk.',
    title: 'Tab Tamer',
    fields: [
      { label: 'Type', value: 'Browser extension' },
      { label: 'Stack', value: 'JavaScript · Chrome & Safari Web Extensions' },
    ],
    bullets: [
      'Sorts open tabs into Focus now, Read later, Off track, and Your call based on a stated goal',
      'Added a confidence slider that controls how many tabs go to manual review',
      'Built a preview-only cleanup review that flags finished, redundant, and stale tabs without closing anything',
    ],
    link: { label: 'View repository', href: 'https://github.com/j-ctang/tab-tamer' },
  },
  {
    id: 'cancelwatch',
    region: 'forge',
    poeticName: 'The Watchful Bell',
    lore: 'It rings three days early, so no one pays for a door already closed.',
    title: 'CancelWatch',
    fields: [
      { label: 'Type', value: 'Web app' },
      { label: 'Stack', value: 'Next.js · TypeScript · Supabase · Resend · Vercel' },
    ],
    bullets: [
      "Emails parents before a kid-activity membership's cancellation notice window closes",
      'Computes cancel-by deadlines from start date, renewal cycle, and notice period, rolling forward each cycle',
      'Uses passwordless private-link accounts and a daily Vercel Cron job for 3-day and 1-day reminders',
    ],
    link: { label: 'View repository', href: 'https://github.com/j-ctang/cancelwatch' },
  },
  {
    id: 'uci',
    region: 'academy',
    poeticName: "Anteater's Ferry",
    lore: 'Four years of crossing, one steady oar-stroke at a time.',
    title: 'B.S. Computer Science',
    org: 'University of California, Irvine',
    dates: 'Fall 2025 – Spring 2029 (expected)',
    fields: [{ label: 'Status', value: '2nd-year undergraduate' }],
    bullets: [],
  },
  {
    id: 'languages',
    region: 'toolmakers',
    poeticName: 'The Twin Scribes',
    lore: 'One writes quickly, one writes exactly; both copy the same thought.',
    title: 'Programming Languages',
    fields: [{ label: 'Languages', value: 'Python · C++' }],
    bullets: [],
  },
  {
    id: 'ml-robotics',
    region: 'toolmakers',
    poeticName: 'The Mimic',
    lore: 'It watches a motion once, then makes the motion its own.',
    title: 'ML & Robotics',
    fields: [
      { label: 'Frameworks', value: 'PyTorch · Hugging Face · LeRobot · ManiSkill' },
      { label: 'Policies', value: 'VLA models · ACT · Diffusion Policy' },
    ],
    bullets: [],
  },
  {
    id: 'systems',
    region: 'toolmakers',
    poeticName: 'The Two Hearths',
    lore: 'Two hearths where every tool is kept warm.',
    title: 'Systems',
    fields: [{ label: 'Platforms', value: 'Linux · macOS' }],
    bullets: [],
  },
]
