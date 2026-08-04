import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');
const componentsDir = path.join(srcDir, 'components');
const utilsDir = path.join(srcDir, 'utils');
const dataDir = path.join(srcDir, 'data');

[componentsDir, utilsDir, dataDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Create utils
fs.writeFileSync(path.join(utilsDir, 'audioAlert.ts'), `
export const playAlertSiren = (severity) => {
  console.log('Playing siren for:', severity);
};
`);

// Create data
fs.writeFileSync(path.join(dataDir, 'initialStations.ts'), `
export const INITIAL_STATIONS = [];
export const NAKHON_PHANOM_DISTRICTS = ['เมืองนครพนม', 'ธาตุพนม', 'ศรีสงคราม', 'ท่าอุเทน', 'บ้านแพง', 'นาแก', 'นาหว้า', 'โพนสวรรค์', 'ปลาปาก', 'เรณูนคร', 'นาทม', 'วังยาง'];
export const calculateWaterStatus = (level, bank, warning, critical) => {
  if (level >= critical) return 'critical';
  if (level >= warning) return 'warning';
  return 'normal';
};
`);

// Create components
const components = [
  'Navbar',
  'SummaryStats',
  'NakhonPhanomMap',
  'StationCardGrid',
  'StationDetailModal',
  'AlertNotificationDrawer',
  'SimulationControlBar',
  'RainfallSourcesModal',
  'NakhonPhanomRainModal',
  'ExecutiveSummaryModal'
];

components.forEach(comp => {
  const fileContent = "import React from 'react';\n\nexport const " + comp + " = (props) => {\n" +
  "  if (props.isOpen === false) return null;\n" +
  "  return (\n" +
  "    <div className=\"p-4 border border-slate-700 rounded-lg m-2 bg-slate-800 text-slate-200\">\n" +
  "      <h3 className=\"font-bold text-lg\">" + comp + "</h3>\n" +
  "      <pre className=\"text-xs overflow-auto max-h-32 mt-2 opacity-50\">{JSON.stringify(props, null, 2)}</pre>\n" +
  "      {props.onClose && (\n" +
  "        <button onClick={props.onClose} className=\"mt-2 bg-red-600 px-3 py-1 rounded text-white text-sm\">Close</button>\n" +
  "      )}\n" +
  "    </div>\n" +
  "  );\n" +
  "};\n";
  fs.writeFileSync(path.join(componentsDir, comp + '.tsx'), fileContent);
});

console.log('Dummy files created successfully.');
