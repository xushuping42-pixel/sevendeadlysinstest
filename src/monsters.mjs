export function monster(id, {label='',className=''}={}) {
 const body={pride:'#AA83DA',greed:'#88B878',lust:'#ED83A8',envy:'#B9C65C',gluttony:'#E6A967',wrath:'#ED7956',sloth:'#8EADD8'}[id]||'#AA83DA';
 const face=id==='sloth'?'<path d="M76 111q10 12 20 0m32 0q10 12 20 0"/>':id==='envy'?'<ellipse cx="111" cy="105" rx="29" ry="24" fill="#fff9e9"/><ellipse cx="116" cy="106" rx="8" ry="12" fill="#30272B" stroke="none"/><circle cx="119" cy="102" r="3" fill="white" stroke="none"/>':'<ellipse cx="85" cy="105" rx="6" ry="9" fill="#30272B" stroke="none"/><ellipse cx="136" cy="105" rx="6" ry="9" fill="#30272B" stroke="none"/><circle cx="87" cy="102" r="2" fill="white" stroke="none"/><circle cx="138" cy="102" r="2" fill="white" stroke="none"/>';
 const mouth=id==='wrath'?'<path d="M102 134q9-10 18 0"/><path d="m72 89 19 5m39 0 17-5"/>':id==='sloth'?'<ellipse cx="112" cy="136" rx="6" ry="7" fill="#30272B"/>':'<path d="M100 133q12 15 24 0" fill="#fff9e9"/>';
 const shapes={
 pride:'<path d="M58 157q-17-44 4-75l-3-26 26 12q27-12 53 0l26-12-3 28q23 37 3 73l-8 17-22-8q-23 10-44 0l-24 8Z"/>',
 greed:'<path d="M71 73q-13-25-21-18l2 34q-20 43 6 74 45 29 102 0 24-33 2-74l6-35q-15-8-26 17-36-12-71 2Z"/>',
 lust:'<path d="M111 66q-27-30-49-10-20 19-3 43-23 41 5 66 45 24 93-1 26-27 6-66 15-24-6-43-21-17-46 11Z"/>',
 envy:'<path d="M108 59q-21-21-11-35 27 5 29 33 31 1 42 35 18 45-12 73-44 21-90-2-27-33-6-74 14-30 48-30Z"/>',
 gluttony:'<path d="M51 123q-8-55 58-59 66-3 67 57 13 53-62 55-72 0-63-53Z"/><path d="m67 75-7-21q19-5 28 14m47 0q11-19 28-13l-8 21"/>',
 wrath:'<path d="M59 159q-30-32-9-66 1 19 12 17-4-33 14-57 1 26 14 25 10-23 8-49 37 19 39 52 17-5 19-25 20 23 16 52 18-2 20-17 17 49-16 72-50 22-117-4Z"/>',
 sloth:'<path d="M51 142q-17-26 6-43-3-25 22-28 14-23 37-9 24-11 35 12 31 0 29 29 23 19 5 40 4 29-35 31-25 12-44 0-30 10-42-7-18 0-13-25Z"/>'
 };
 const props={
 pride:'<path d="m82 55-8-26 24 11 15-23 13 23 23-10-8 26Z" fill="#F6CE64"/><path d="M91 49h43"/><circle cx="113" cy="40" r="3" fill="#fff9e9" stroke="none"/>',
 greed:'<path d="m126 127 10-12 23 5 5 15q30 29 4 43-23 10-46-2-19-22 4-49Z" fill="#F3D078"/><path d="m134 125 23 4"/><path d="M145 143v20m7-16q-15-8-15 1 0 5 13 6 8 8-11 7" stroke-width="2.5"/><circle cx="54" cy="167" r="12" fill="#F3D078"/>',
 lust:'<path d="M111 174q-27-18-22-30 9-15 22-2 15-14 23 1 8 13-23 31Z" fill="#C84972"/><path d="m42 70 2-8m-6 4h10m129-18 2-10m-6 5h11" stroke="#C84972" stroke-width="3"/>',
 envy:'<path d="M98 54q-16-2-17-18" fill="none"/><path d="m167 140 13-4 10 5-8 22-22-1" fill="#EBE8AF"/><path d="m173 141 9 4-5 12" stroke-width="2"/>',
 gluttony:'<circle cx="113" cy="160" r="24" fill="#F2CC8E"/><path d="m103 146 2 4m17-2-2 3m-18 12 3 1m18 2-1 3m-10-8 2-2" stroke="#87523D" stroke-width="5"/><path d="M55 149q12 13 26 7m66 1q16 5 23-7" fill="none"/>',
 wrath:'<path d="m183 53 6-13m-3 29 14-1M44 53l-8-10" stroke="#B94A36" stroke-width="3"/><path d="m86 162 13-13 17 12 13-12 12 13" fill="none"/>',
 sloth:'<path d="m55 150 22-5 19 8 20-6 25 8 24-5 15 15q-26 25-65 17-40 5-60-14Z" fill="#B6A1D8"/><path d="m84 160 9 14m30-17 6 18m24-18 8 12" stroke="#D6C8ED" stroke-width="5"/><path d="M173 64h13l-13 15h13m2-40h12l-12 14h12" fill="none" stroke="#6C7FA2" stroke-width="3"/>'
 };
 return `<svg class="monster ${className}" viewBox="0 0 224 210" xmlns="http://www.w3.org/2000/svg" ${label?`role="img" aria-label="${label}"`:'aria-hidden="true"'}><ellipse cx="113" cy="187" rx="67" ry="8" fill="#30272B" opacity=".09"/><g stroke="#30272B" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><g fill="${body}">${shapes[id]||shapes.pride}</g><g fill="none">${face}${mouth}</g><g fill="#F7B0A8" stroke="none" opacity=".7"><ellipse cx="69" cy="124" rx="10" ry="5"/><ellipse cx="151" cy="124" rx="10" ry="5"/></g>${props[id]||''}</g></svg>`;
}
