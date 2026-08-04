
export const INITIAL_STATIONS = [];
export const NAKHON_PHANOM_DISTRICTS = ['เมืองนครพนม', 'ธาตุพนม', 'ศรีสงคราม', 'ท่าอุเทน', 'บ้านแพง', 'นาแก', 'นาหว้า', 'โพนสวรรค์', 'ปลาปาก', 'เรณูนคร', 'นาทม', 'วังยาง'];
export const calculateWaterStatus = (level, bank, warning, critical) => {
  if (level >= critical) return 'critical';
  if (level >= warning) return 'warning';
  return 'normal';
};
