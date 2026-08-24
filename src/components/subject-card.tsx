type FieldProps = {
  code: string;
  title: string;
  cp: number;
  color: string;
  year: string;
};

function SubjectCard({code, title, cp, color, year}:FieldProps) {

  //takes the user to the subject's uow handbook page
  const openInNewTab = (url: string): void => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
  }

  return (
      <button className="w-full text-left transition-transform hover:-translate-y-0.5"
              onClick={() => openInNewTab(`https://courses.uow.edu.au/subjects/2026/${code}`)}>
        <div style={{backgroundColor: color}}
        className="h-full rounded-[16px] border border-white/70 shadow-[0_2px_8px_rgba(0,1,129,0.06)]">
            <div className="flex min-h-[78px] flex-col rounded-[16px] p-3 text-[#000181]">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-extrabold tracking-tight">{code}</p>
                  <p className="shrink-0 rounded-full bg-white/65 px-2 py-0.5 text-[9px] font-extrabold">{cp} cp</p>
                </div>
                <p className="mt-1.5 line-clamp-2 text-[10px] font-semibold leading-snug text-[rgba(0,1,129,0.68)]">{title}</p>

                {/* <button className='bg-white rounded-3xl py-1 px-4 flex gap-2 text-xs justify-center items-center'>
                    <span><SquarePen size={12} className="text-[#000181]" /></span>
                    <p className='text-xs'>Edit</p>
                </button> */}

            </div>

        </div>

      </button>
    

    
  );
}

export default SubjectCard;
