// Maps country names → continent, for the "world explored" globe.
// Names are lowercased on lookup, with a few common aliases handled.

export const CONTINENTS = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica'] as const;
export type Continent = typeof CONTINENTS[number];

export const TOTAL_COUNTRIES = 195; // UN members + observers

const MAP: Record<string, Continent> = {};
const add = (c: Continent, names: string[]) => names.forEach(n => { MAP[n.toLowerCase()] = c; });

add('Europe', ['albania','andorra','austria','belarus','belgium','bosnia and herzegovina','bosnia','bulgaria','croatia','cyprus','czech republic','czechia','denmark','estonia','finland','france','germany','greece','hungary','iceland','ireland','italy','kosovo','latvia','liechtenstein','lithuania','luxembourg','malta','moldova','monaco','montenegro','netherlands','holland','north macedonia','macedonia','norway','poland','portugal','romania','russia','san marino','serbia','slovakia','slovenia','spain','sweden','switzerland','ukraine','united kingdom','uk','great britain','britain','england','scotland','wales','northern ireland','vatican city','vatican']);
add('Asia', ['afghanistan','armenia','azerbaijan','bahrain','bangladesh','bhutan','brunei','cambodia','china','georgia','india','indonesia','iran','iraq','israel','japan','jordan','kazakhstan','kuwait','kyrgyzstan','laos','lebanon','malaysia','maldives','mongolia','myanmar','burma','nepal','north korea','oman','pakistan','palestine','philippines','qatar','saudi arabia','singapore','south korea','korea','sri lanka','syria','taiwan','tajikistan','thailand','timor-leste','east timor','turkey','turkiye','turkmenistan','united arab emirates','uae','dubai','abu dhabi','uzbekistan','vietnam','yemen']);
add('Africa', ['algeria','angola','benin','botswana','burkina faso','burundi','cabo verde','cape verde','cameroon','central african republic','chad','comoros','congo','democratic republic of the congo','dr congo','djibouti','egypt','equatorial guinea','eritrea','eswatini','swaziland','ethiopia','gabon','gambia','ghana','guinea','guinea-bissau','ivory coast','cote d ivoire','kenya','lesotho','liberia','libya','madagascar','malawi','mali','mauritania','mauritius','morocco','mozambique','namibia','niger','nigeria','rwanda','sao tome and principe','senegal','seychelles','sierra leone','somalia','south africa','south sudan','sudan','tanzania','zanzibar','togo','tunisia','uganda','zambia','zimbabwe']);
add('North America', ['antigua and barbuda','bahamas','barbados','belize','canada','costa rica','cuba','dominica','dominican republic','el salvador','grenada','guatemala','haiti','honduras','jamaica','mexico','nicaragua','panama','saint kitts and nevis','saint lucia','saint vincent and the grenadines','trinidad and tobago','united states','usa','us','america','united states of america']);
add('South America', ['argentina','bolivia','brazil','chile','colombia','ecuador','guyana','paraguay','peru','suriname','uruguay','venezuela']);
add('Oceania', ['australia','fiji','kiribati','marshall islands','micronesia','nauru','new zealand','palau','papua new guinea','samoa','solomon islands','tonga','tuvalu','vanuatu']);
add('Antarctica', ['antarctica']);

export function continentOf(country: string): Continent | null {
  return MAP[country.trim().toLowerCase()] || null;
}

export function worldStats(countries: string[]) {
  const continents = new Set<Continent>();
  for (const c of countries) {
    const cont = continentOf(c);
    if (cont) continents.add(cont);
  }
  const uniqueCountries = new Set(countries.map(c => c.trim().toLowerCase()));
  const pct = Math.round((uniqueCountries.size / TOTAL_COUNTRIES) * 1000) / 10;
  return {
    continentsVisited: Array.from(continents),
    continentCount: continents.size,
    countryCount: uniqueCountries.size,
    percentExplored: pct,
  };
}
