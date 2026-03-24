import type { ResumeData } from '@/types/resume'

export const DEFAULT_RESUME: ResumeData = {
  id: crypto.randomUUID(),
  personalInfo: {
    fullName: 'Alexander Mitchell',
    jobTitle: 'Senior Software Engineer',
    email: 'alex.mitchell@email.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedinUrl: 'linkedin.com/in/amitchell',
    portfolioWebsite: 'alexmitchell.dev',
  },
  sections: [
    {
      id: crypto.randomUUID(),
      type: 'summary',
      title: 'Summary',
      order: 0,
      visible: true,
      content:
        'Experienced software engineer with 8+ years of expertise in building scalable web applications and distributed systems. Passionate about clean architecture, performance optimization, and mentoring junior developers. Proven track record of leading cross-functional teams to deliver high-impact solutions.',
    },
    {
      id: crypto.randomUUID(),
      type: 'work-experience',
      title: 'Work Experience',
      order: 1,
      visible: true,
      entries: [
        {
          id: crypto.randomUUID(),
          title: 'Senior Software Engineer',
          company: 'TechCorp',
          startDate: '2021',
          endDate: 'Present',
          current: true,
          bullets: [
            'Lead the migration of a monolith web application to microservices, improving scalability by 3x.',
            'Implemented CI/CD pipelines and automated testing, reducing deployment time by 60%.',
            'Mentored a team of 5 engineers and established coding standards, improving code review efficiency.',
          ],
        },
        {
          id: crypto.randomUUID(),
          title: 'Software Engineer',
          company: 'InnovateTech',
          startDate: '2018',
          endDate: '2021',
          current: false,
          bullets: [
            'Developed and maintained a high-traffic e-commerce platform serving 1M+ daily users.',
            'Built RESTful APIs and integrated third-party payment processing, handling $50M+ annually.',
            'Contributed to open-source projects and presented talks at local developer meetups.',
          ],
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'education',
      title: 'Education',
      order: 2,
      visible: true,
      entries: [
        {
          id: crypto.randomUUID(),
          degree: 'B.S. Computer Science',
          school: 'State University',
          startDate: '2014',
          endDate: '2018',
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'skills',
      title: 'Skills',
      order: 3,
      visible: true,
      categories: [
        {
          id: crypto.randomUUID(),
          name: 'Languages',
          skills: ['TypeScript', 'JavaScript', 'Go', 'Python', 'Java', 'SQL'],
        },
        {
          id: crypto.randomUUID(),
          name: 'Frameworks',
          skills: ['React', 'Node.js', 'Express', 'Next.js', 'Tailwind CSS'],
        },
        {
          id: crypto.randomUUID(),
          name: 'Tools',
          skills: ['AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'Git'],
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'projects',
      title: 'Projects',
      order: 4,
      visible: true,
      entries: [
        {
          id: crypto.randomUUID(),
          name: 'Open Source CLI Tool — DevSync',
          description:
            'A developer productivity CLI tool for syncing local development environments across teams.',
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'certifications',
      title: 'Certifications',
      order: 5,
      visible: true,
      entries: [
        {
          id: crypto.randomUUID(),
          name: 'AWS Solutions Architect Associate',
          issuer: 'Amazon Web Services',
          date: '2023',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
