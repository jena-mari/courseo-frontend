import {
  SquarePen 
} from "lucide-react";

type FieldProps = {
  code: string;
  title: string;
  cp: number;
  color: string;
};

function SubjectCard({code, title, cp, color}:FieldProps) {

  return (
      <div className='max-w-72 flex-1 justify-center items-stretch w-full'>
        <div style={{backgroundColor: color}}
        className='rounded-3xl h-full'>             
            <div className="rounded-3xl p-2 flex flex-col justify-center items-center text-center text-[#000181]">
                <p className='text-1xl font-extrabold text-center'>{code}</p>
                
                <div className='pt-1 pb-2 w-full'>
                    <div className='h-1 border-b-2 border-[#000181] w-full'></div>
                </div>

                <div className='flex items-center justify-between ext-1xl font-semibold text-xs gap-1'>
                    <p>{title}</p>
                </div>

                <p className='text-xs py-1'>{cp} cp</p>

                {/* <button className='bg-white rounded-3xl py-1 px-4 flex gap-2 text-xs justify-center items-center'>
                    <span><SquarePen size={12} className="text-[#000181]" /></span>
                    <p className='text-xs'>Edit</p>
                </button> */}

            </div>

        </div>

      </div>
    

    
  );
}

export default SubjectCard;