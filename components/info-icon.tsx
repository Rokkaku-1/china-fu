export default function InfoIcon({kind}: {kind:'location'|'phone'|'clock'}) {
 return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{kind==='location'?<><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></>:kind==='clock'?<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>:<path d="m7 3 3 4-2 2c1 3 4 6 7 7l2-2 4 3-1 3c-1 2-6 0-10-4S3 7 4 5Z"/>}</svg>;
}
