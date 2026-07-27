import React from 'react';

const FilterSideBar = () => {
  return (
    <div className="w-[310px] p-4 flex flex-col gap-4  sticky top-0 h-[712px] overflow-y-auto bg-white">
      <h2 className="text-lg font-semibold text-[#515151] mb-4">Refine publications by</h2>

      <div className="mb-4">
        <label className="block  text-[#515151] text-sm font-medium mb-1">Select subject area</label>
        <select className="w-full text-[#515151] border-b-2 px-2 py-1 ">
          <option>All subject areas</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block  text-[#515151]  text-sm font-medium mb-1">Select secondary subject area</label>
        <select className="w-full text-[#515151] border-b-2 px-2 py-1 ">
          <option>All secondary subject areas</option>
        </select>
      </div>

      <div className="mb-4 flex flex-col gap-1 text-[#515151]">
        <h3 className="font-medium mb-1 text-[#515151]">Publication type</h3>
        {['Journals', 'Books', 'Textbooks', 'Handbooks', 'Reference works', 'Book series'].map(type => (
          <div key={type} className="flex items-center space-x-2">
            <input type="checkbox" />
            <label>{type}</label>
          </div>
        ))}
      </div>

      <div className="mb-4  flex flex-col gap-1 text-[#515151] ">
        <h3 className="font-medium mb-1">Journal status</h3>
        <div className="flex items-center space-x-2">
          <input type="checkbox" />
          <label>Accepts submissions</label>
        </div>
      </div>

      <div className='flex flex-col gap-1 text-[#515151]'>
        <h3 className="font-medium mb-1  ">Access type</h3>
        {['Open access', 'Contains open access', 'Subscribed & complimentary'].map(type => (
          <div key={type} className="flex items-center space-x-2">
            <input type="checkbox" />
            <label>{type}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterSideBar;
