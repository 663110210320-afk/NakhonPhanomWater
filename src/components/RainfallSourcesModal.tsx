import React from 'react';

export const RainfallSourcesModal = (props) => {
  if (props.isOpen === false) return null;
  return (
    <div className="p-4 border border-slate-700 rounded-lg m-2 bg-slate-800 text-slate-200">
      <h3 className="font-bold text-lg">RainfallSourcesModal</h3>
      <pre className="text-xs overflow-auto max-h-32 mt-2 opacity-50">{JSON.stringify(props, null, 2)}</pre>
      {props.onClose && (
        <button onClick={props.onClose} className="mt-2 bg-red-600 px-3 py-1 rounded text-white text-sm">Close</button>
      )}
    </div>
  );
};
