type FieldProps = {
  code: string;
  title: string;
  cp: number;
  color: string;
};

function SubjectCard({code, title, cp, color}:FieldProps) {

  //takes the user to the subject's uow handbook page
  const openInNewTab = (url: string): void => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
  }

  return (
      <button className="w-full text-left transition-transform hover:-translate-y-0.5"
              onClick={() => openInNewTab(`https://courses.uow.edu.au/subjects/2026/${code}`)}>
        <div style={{ backgroundColor: color }} className="h-full rounded-[16px] border-2 border-white/80 shadow-[0_2px_8px_rgba(0,1,129,0.08)]">
            <div className="flex min-h-[94px] flex-col rounded-[16px] p-3.5 text-[#000181]">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[16px] font-extrabold tracking-tight">{code}</p>
                  <p className="shrink-0 rounded-full bg-[rgba(0,1,129,0.06)] px-2.5 py-1 text-[11px] font-extrabold">{cp} cp</p>
                </div>
                <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-snug text-[rgba(0,1,129,0.68)]">{title}</p>

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
