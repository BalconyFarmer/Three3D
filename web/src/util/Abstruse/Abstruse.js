/**
 * 省级 zhdj 二级页面
 */
import { yunanMapData } from "./map/mapDataForEcahrt/manualYunnan";
import { Radio } from "./echartOptions/Radio";
import { Lines } from "./echartOptions/Lines";
import { SingleNumber } from "./echartOptions/SingleNumber";
import { Bar } from "./echartOptions/Bar";
import { Pie } from "./echartOptions/Pie";
import { MapFromGaode } from "./map/MapFromGaode";
import { MapFormEchart } from "./map/MapFormEchart";


let Abstruse = {};
Abstruse.Radio = Radio;
Abstruse.Lines = Lines;
Abstruse.Bar = Bar;
Abstruse.Pie = Pie;
Abstruse.MapFromGaode = MapFromGaode;
Abstruse.MapFormEchart = MapFormEchart;
Abstruse.SingleNumber = SingleNumber;
Abstruse.yunanMapData = yunanMapData;
export { Abstruse };
