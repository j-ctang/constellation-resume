// All resume content lives here. Edit this file to change the site; components read it generically.

export type Region = 'guild' | 'forge' | 'academy' | 'toolmakers'

export interface SkyField {
  label: string
  value: string
}

export interface SkyEntry {
  /** kebab-case, unique. Seeds the star layout, so renaming an id reshapes its constellation. */
  id: string
  region: Region
  poeticName: string
  lore: string
  title: string
  org?: string
  dates?: string
  fields: SkyField[]
  bullets: string[]
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
  links: { label: string; href: string }[]
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
  },
  {
    id: 'uci',
    region: 'academy',
    poeticName: "The Anteater's Lamp",
    lore: 'Four winters of study, lit by a small and stubborn flame.',
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
