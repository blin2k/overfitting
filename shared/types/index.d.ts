export interface User {
    id: string;
    email: string;
    createdAt: Date;
}
export interface ContactInfo {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
}
export interface Experience {
    company: string;
    title: string;
    startDate: string;
    endDate?: string;
    bullets: string[];
    techStack: string[];
}
export interface Project {
    name: string;
    description: string;
    bullets: string[];
    techStack: string[];
    url?: string;
}
export interface Education {
    institution: string;
    degree: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
    relevantCoursework?: string[];
}
export interface ParsedResume {
    contactInfo: ContactInfo;
    summary?: string;
    experience: Experience[];
    projects: Project[];
    education: Education[];
    skills: string[];
}
export interface Resume {
    id: string;
    userId: string;
    rawText: string;
    parsedData: ParsedResume;
    uploadedAt: Date;
}
export interface ParsedJD {
    title: string;
    company?: string;
    requiredSkills: string[];
    preferredSkills: string[];
    responsibilities: string[];
    rawRequirements: string[];
}
export interface JobDescription {
    id: string;
    userId: string;
    rawText: string;
    parsedData: ParsedJD;
    uploadedAt: Date;
}
export interface ToolGap {
    userHas: string;
    jdWants: string;
    category: string;
    recommendation: string;
}
export interface TrueGap {
    jdRequires: string;
    category: string;
    isRequired: boolean;
    recommendation: string;
}
export interface GapAnalysis {
    toolGaps: ToolGap[];
    trueGaps: TrueGap[];
}
export interface GeneratedResume {
    id: string;
    userId: string;
    resumeId: string;
    jobDescriptionId: string;
    fittingLevel: number;
    latexContent: string;
    gapAnalysis: GapAnalysis;
    createdAt: Date;
}
export interface GenerateRequest {
    resumeId: string;
    jobDescriptionId: string;
    fittingLevel: number;
}
export interface GenerateResponse {
    generatedResume: GeneratedResume;
    gapAnalysis: GapAnalysis;
}
export interface UploadResumeRequest {
    rawText: string;
}
export interface UploadJDRequest {
    rawText: string;
}
//# sourceMappingURL=index.d.ts.map