
interface linkProps {
    year: string;
    degree: string;
    campus: string;
}

// map of all current copilot agents for degrees
const nestedLinkMap: Record<string, Partial<Record<string, Partial<Record<string, string>>>>> = {
    2026: {
        1807: {
            Wollongong: 'https://m365.cloud.microsoft/chat/?titleId=T_5c978020-5344-cdcd-55b3-3e9f458833f6&source=embedded-builder',
            Liverpool: 'https://m365.cloud.microsoft/chat/?titleId=T_0ac4b7b8-0eef-7376-66e5-5ade932e22f2&source=embedded-builder',
        }
    }
}

// if no link can be found, direct the user to a blank page
const defaultLink = ''

//function to return the correct copilot agent link from the given year, degree and campus
export default function copilotLink({ year, degree, campus}: linkProps): string {
    return nestedLinkMap[year]?.[degree]?.[campus] ?? defaultLink;
}