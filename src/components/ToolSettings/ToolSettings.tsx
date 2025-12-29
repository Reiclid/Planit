'use client';
import Slider from '@mui/material/Slider';
import { useStore } from '@/store/useStore';

const ToolSettings = () => {
    const { penSetting, setPenSetting } = useStore();

    const handleChange = (event: Event, newValue: number | number[]) => {
        setPenSetting({ 
            ...penSetting, 
            size: newValue as number 
        });
    };

    return (
        <div className={`absolute z-10 flex justify-center w-full h-12 bg-gray-200`}>
            <span className={` w-[300px]`}>
                <Slider value={penSetting.size} onChange={handleChange} marks min={1} max={30} />
            </span>
        </div>
    );
}


export default ToolSettings;