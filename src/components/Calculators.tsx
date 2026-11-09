/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Zap, 
  Activity, 
  ShieldCheck, 
  Hammer, 
  ArrowRightLeft, 
  Info,
  Scale,
  Calculator,
  Scissors,
  Utensils,
  Gauge,
  CircuitBoard
} from "lucide-react";

export default function Calculators() {
  const [activeCalc, setActiveCalc] = useState<"units" | "scale" | "percent" | "error" | "machining" | "circuits" | "recipe" | "sewing" | "electrical" | "mechanical" | "hardness">("units");

  const unitGroups = {
    length: { label: "Длина", units: { mm: ["мм", 0.001], cm: ["см", 0.01], m: ["м", 1], km: ["км", 1000] } },
    area: { label: "Площадь", units: { mm2: ["мм²", 0.000001], cm2: ["см²", 0.0001], m2: ["м²", 1], ha: ["га", 10000] } },
    volume: { label: "Объём", units: { ml: ["мл", 0.000001], l: ["л", 0.001], cm3: ["см³", 0.000001], m3: ["м³", 1] } },
    mass: { label: "Масса", units: { mg: ["мг", 0.000001], g: ["г", 0.001], kg: ["кг", 1], t: ["т", 1000] } },
    power: { label: "Мощность", units: { w: ["Вт", 1], kw: ["кВт", 1000], mw: ["МВт", 1000000] } },
    energy: { label: "Энергия", units: { j: ["Дж", 1], kj: ["кДж", 1000], wh: ["Вт·ч", 3600], kwh: ["кВт·ч", 3600000] } }
  } as const;
  type UnitGroup = keyof typeof unitGroups;
  const [unitGroup, setUnitGroup] = useState<UnitGroup>("length");
  const [unitValue, setUnitValue] = useState(1);
  const [unitFrom, setUnitFrom] = useState("m");
  const [unitTo, setUnitTo] = useState("cm");
  const currentUnits = unitGroups[unitGroup].units as Record<string, readonly [string, number]>;
  const unitResult = unitValue * (currentUnits[unitFrom]?.[1] || 1) / (currentUnits[unitTo]?.[1] || 1);

  const [realSize, setRealSize] = useState(1000);
  const [scaleDenominator, setScaleDenominator] = useState(10);
  const drawingSize = realSize / Math.max(scaleDenominator, 0.000001);

  const [percentBase, setPercentBase] = useState(800);
  const [percentValue, setPercentValue] = useState(15);
  const [proportionA, setProportionA] = useState(2);
  const [proportionB, setProportionB] = useState(5);
  const [proportionC, setProportionC] = useState(12);
  const proportionX = proportionA ? proportionB * proportionC / proportionA : 0;

  const [referenceValue, setReferenceValue] = useState(100);
  const [measuredValue, setMeasuredValue] = useState(98.5);
  const absoluteError = Math.abs(measuredValue - referenceValue);
  const relativeError = referenceValue ? absoluteError / Math.abs(referenceValue) * 100 : 0;

  const [cuttingSpeed, setCuttingSpeed] = useState(25);
  const [toolDiameter, setToolDiameter] = useState(10);
  const [feedPerRev, setFeedPerRev] = useState(0.15);
  const [cutLength, setCutLength] = useState(100);
  const spindleRpm = toolDiameter > 0 ? 1000 * cuttingSpeed / (Math.PI * toolDiameter) : 0;
  const machiningMinutes = spindleRpm > 0 && feedPerRev > 0 ? cutLength / (spindleRpm * feedPerRev) : 0;

  const [resistanceValues, setResistanceValues] = useState("10, 20, 30");
  const [circuitVoltage, setCircuitVoltage] = useState(12);
  const resistors = resistanceValues.split(/[;,\s]+/).map(Number).filter((value) => Number.isFinite(value) && value > 0);
  const seriesResistance = resistors.reduce((sum, value) => sum + value, 0);
  const parallelResistance = resistors.length ? 1 / resistors.reduce((sum, value) => sum + 1 / value, 0) : 0;

  const [basePortions, setBasePortions] = useState(4);
  const [targetPortions, setTargetPortions] = useState(10);
  const [ingredientAmount, setIngredientAmount] = useState(250);
  const recipeFactor = basePortions > 0 ? targetPortions / basePortions : 0;

  const [patternLength, setPatternLength] = useState(120);
  const [fabricWidth, setFabricWidth] = useState(150);
  const [fabricReserve, setFabricReserve] = useState(10);
  const [fabricPrice, setFabricPrice] = useState(650);
  const fabricMeters = patternLength / 100 * (1 + fabricReserve / 100);
  const fabricCost = fabricMeters * fabricPrice;

  // Ohm's Law state
  const [volts, setVolts] = useState<string>("12");
  const [amps, setAmps] = useState<string>("2");
  const [ohms, setOhms] = useState<string>("6");
  const [watts, setWatts] = useState<string>("24");
  const [electricalError, setElectricalError] = useState<string | null>(null);

  const calculateOhmLaw = (solveFor: "all" | "u" | "i" | "r" | "p") => {
    setElectricalError(null);
    try {
      const vVal = parseFloat(volts);
      const aVal = parseFloat(amps);
      const oVal = parseFloat(ohms);
      const wVal = parseFloat(watts);

      if (solveFor === "u") {
        if (!isNaN(aVal) && !isNaN(oVal)) {
          setVolts((aVal * oVal).toFixed(2));
          setWatts((aVal * aVal * oVal).toFixed(2));
        } else {
          setElectricalError("Пожалуйста, введите Ток (I) и Сопротивление (R)");
        }
      } else if (solveFor === "i") {
        if (!isNaN(vVal) && !isNaN(oVal) && oVal !== 0) {
          setAmps((vVal / oVal).toFixed(2));
          setWatts(((vVal * vVal) / oVal).toFixed(2));
        } else {
          setElectricalError("Пожалуйста, введите Напряжение (U) и ненулевое Сопротивление (R)");
        }
      } else if (solveFor === "r") {
        if (!isNaN(vVal) && !isNaN(aVal) && aVal !== 0) {
          setOhms((vVal / aVal).toFixed(2));
          setWatts((vVal * aVal).toFixed(2));
        } else {
          setElectricalError("Пожалуйста, введите Напряжение (U) и ненулевую Силу тока (I)");
        }
      } else if (solveFor === "p") {
        if (!isNaN(vVal) && !isNaN(aVal)) {
          setWatts((vVal * aVal).toFixed(2));
        } else if (!isNaN(aVal) && !isNaN(oVal)) {
          setWatts((aVal * aVal * oVal).toFixed(2));
        } else {
          setElectricalError("Введите U и I или I и R для расчета мощности");
        }
      }
    } catch (e) {
      setElectricalError("Ошибка вычислений. Проверьте корректность введенных чисел.");
    }
  };

  // Mechanical transmission state
  const [zDriver, setZDriver] = useState<number>(12);
  const [zDriven, setZDriven] = useState<number>(36);
  const [inputRPM, setInputRPM] = useState<number>(1500);
  const [efficiency, setEfficiency] = useState<number>(0.95);

  const gearRatio = zDriven / (zDriver || 1);
  const outputRPM = inputRPM / (gearRatio || 1);
  const torqueMultiplier = gearRatio * efficiency;

  // Hardness Converter state
  const [hardnessVal, setHardnessVal] = useState<number>(300);
  const [hardnessScale, setHardnessScale] = useState<"HB" | "HRC" | "HV">("HB");

  const getConversions = (val: number, scale: "HB" | "HRC" | "HV") => {
    let hb = 0;
    let hrc = 0;
    let hv = 0;

    if (scale === "HB") {
      hb = val;
      // Approximate conversions standard for structural components
      hrc = val > 180 ? Math.round((val - 100) / 10) : 0;
      hv = Math.round(val * 1.05);
    } else if (scale === "HRC") {
      hrc = val;
      hb = Math.round(val * 10 + 100);
      hv = Math.round(hb * 1.08);
    } else {
      hv = val;
      hb = Math.round(val / 1.05);
      hrc = hb > 180 ? Math.round((hb - 100) / 10) : 0;
    }

    return {
      HB: hb < 1 ? "Неприменимо" : `${hb} ед. (шарик)`,
      HRC: hrc < 1 ? "За пределами шкалы" : `${hrc} HRC (алмазный конус)`,
      HV: `${hv} HV (алмазная пирамида)`
    };
  };

  const currentConversions = getConversions(hardnessVal, hardnessScale);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 text-slate-800 shadow-xl max-w-6xl mx-auto animate-fade-in" id="calculators-container">
      {/* Title */}
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Инструментальные калькуляторы ВсОШ
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-sans mt-1">
          Быстрая проверка формул, расчетов электроники и кинематических передач на основе олимпиадных задач прошлых лет.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1.5 rounded-lg mb-6 border border-slate-200">
        {([
          ["units", "Единицы СИ", ArrowRightLeft],
          ["scale", "Масштаб", Scale],
          ["percent", "Проценты", Calculator],
          ["error", "Погрешность", ShieldCheck]
        ] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setActiveCalc(id)} className={`flex min-w-36 flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-xs font-medium transition ${activeCalc === id ? "bg-blue-600 text-white shadow" : "text-slate-550 hover:bg-white hover:text-slate-800"}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
        {([
          ["machining", "Режимы резания", Gauge],
          ["circuits", "Цепи сопротивлений", CircuitBoard],
          ["recipe", "Рецептура", Utensils],
          ["sewing", "Ткань и стоимость", Scissors]
        ] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setActiveCalc(id)} className={`flex min-w-40 flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-xs font-medium transition ${activeCalc === id ? "bg-blue-600 text-white shadow" : "text-slate-550 hover:bg-white hover:text-slate-800"}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
        <button
          onClick={() => setActiveCalc("electrical")}
          className={`min-w-36 flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-medium rounded-md transition cursor-pointer ${
            activeCalc === "electrical" ? "bg-blue-600 text-white shadow" : "text-slate-550 hover:text-slate-800"
          }`}
        >
          <Zap className="h-4 w-4" />
          Электротехника (Ом и Мощность)
        </button>
        <button
          onClick={() => setActiveCalc("mechanical")}
          className={`min-w-36 flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-medium rounded-md transition cursor-pointer ${
            activeCalc === "mechanical" ? "bg-blue-600 text-white shadow" : "text-slate-550 hover:text-slate-800"
          }`}
        >
          <Activity className="h-4 w-4" />
          Кинематика и Редукторы
        </button>
        <button
          onClick={() => setActiveCalc("hardness")}
          className={`min-w-36 flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-medium rounded-md transition cursor-pointer ${
            activeCalc === "hardness" ? "bg-blue-600 text-white shadow" : "text-slate-550 hover:text-slate-800"
          }`}
        >
          <Hammer className="h-4 w-4" />
          Конвертер Твёрдости
        </button>
      </div>

      {activeCalc === "units" && (
        <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-850">Конвертер единиц</h3>
            <div><label className="mb-1 block text-xs text-slate-500">Величина</label><select value={unitGroup} onChange={(e) => { const next = e.target.value as UnitGroup; const keys = Object.keys(unitGroups[next].units); setUnitGroup(next); setUnitFrom(keys[0]); setUnitTo(keys[1]); }} className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-sm">{Object.entries(unitGroups).map(([id, group]) => <option key={id} value={id}>{group.label}</option>)}</select></div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
              <div><label className="mb-1 block text-xs text-slate-500">Исходное значение</label><input type="number" value={unitValue} onChange={(e) => setUnitValue(Number(e.target.value))} className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-sm" /></div>
              <ArrowRightLeft className="mb-2 h-4 w-4 text-blue-600" />
              <div><label className="mb-1 block text-xs text-slate-500">Результат</label><div className="rounded border border-blue-200 bg-blue-50 p-2 text-sm font-bold text-blue-800">{Number.isFinite(unitResult) ? unitResult.toLocaleString("ru-RU", { maximumFractionDigits: 8 }) : "—"}</div></div>
            </div>
            <div className="grid grid-cols-2 gap-3"><select value={unitFrom} onChange={(e) => setUnitFrom(e.target.value)} className="rounded border border-slate-200 bg-white p-2 text-sm">{Object.entries(currentUnits).map(([id, unit]) => <option key={id} value={id}>{unit[0]}</option>)}</select><select value={unitTo} onChange={(e) => setUnitTo(e.target.value)} className="rounded border border-slate-200 bg-white p-2 text-sm">{Object.entries(currentUnits).map(([id, unit]) => <option key={id} value={id}>{unit[0]}</option>)}</select></div>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-xs leading-relaxed text-slate-600"><strong className="mb-2 block text-sm text-blue-900">Контроль единиц</strong>Перед расчётом приведите все величины к одной системе. Для площади и объёма коэффициент перевода также возводится соответственно в квадрат или куб.</div>
        </div>
      )}

      {activeCalc === "scale" && (
        <div className="grid gap-6 md:grid-cols-2 animate-fade-in"><div className="space-y-4"><h3 className="text-sm font-semibold">Расчёт масштаба чертежа или выкройки</h3><div className="grid grid-cols-2 gap-3"><div><label className="mb-1 block text-xs text-slate-500">Натуральный размер, мм</label><input type="number" value={realSize} onChange={(e) => setRealSize(Number(e.target.value))} className="w-full rounded border border-slate-200 bg-slate-50 p-2" /></div><div><label className="mb-1 block text-xs text-slate-500">Знаменатель 1:n</label><input type="number" min="0.000001" value={scaleDenominator} onChange={(e) => setScaleDenominator(Number(e.target.value))} className="w-full rounded border border-slate-200 bg-slate-50 p-2" /></div></div><div className="rounded-xl border border-blue-200 bg-blue-50 p-5"><span className="text-xs text-slate-500">Размер на изображении</span><strong className="mt-1 block text-3xl text-blue-700">{drawingSize.toLocaleString("ru-RU", { maximumFractionDigits: 3 })} мм</strong></div></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs leading-relaxed text-slate-600"><strong className="mb-2 block text-sm text-slate-800">Формула</strong>Размер на чертеже = натуральный размер ÷ n. Для масштаба увеличения 2:1 укажите знаменатель 0,5.</div></div>
      )}

      {activeCalc === "percent" && (
        <div className="grid gap-6 md:grid-cols-2 animate-fade-in"><div className="space-y-4"><h3 className="text-sm font-semibold">Процент от числа</h3><div className="grid grid-cols-2 gap-3"><input type="number" value={percentBase} onChange={(e) => setPercentBase(Number(e.target.value))} className="rounded border border-slate-200 bg-slate-50 p-2" aria-label="Базовое число"/><input type="number" value={percentValue} onChange={(e) => setPercentValue(Number(e.target.value))} className="rounded border border-slate-200 bg-slate-50 p-2" aria-label="Процент"/></div><div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm"><strong>{percentValue}% от {percentBase} = {(percentBase * percentValue / 100).toLocaleString("ru-RU", { maximumFractionDigits: 4 })}</strong><div className="mt-2 text-xs text-slate-600">После увеличения: {(percentBase * (1 + percentValue / 100)).toLocaleString("ru-RU", { maximumFractionDigits: 4 })} · после уменьшения: {(percentBase * (1 - percentValue / 100)).toLocaleString("ru-RU", { maximumFractionDigits: 4 })}</div></div></div><div className="space-y-4"><h3 className="text-sm font-semibold">Пропорция a : b = c : x</h3><div className="grid grid-cols-3 gap-3"><input type="number" value={proportionA} onChange={(e) => setProportionA(Number(e.target.value))} className="rounded border border-slate-200 bg-slate-50 p-2" aria-label="a"/><input type="number" value={proportionB} onChange={(e) => setProportionB(Number(e.target.value))} className="rounded border border-slate-200 bg-slate-50 p-2" aria-label="b"/><input type="number" value={proportionC} onChange={(e) => setProportionC(Number(e.target.value))} className="rounded border border-slate-200 bg-slate-50 p-2" aria-label="c"/></div><div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 font-bold text-indigo-800">x = {proportionX.toLocaleString("ru-RU", { maximumFractionDigits: 4 })}</div></div></div>
      )}

      {activeCalc === "error" && (
        <div className="grid gap-6 md:grid-cols-2 animate-fade-in"><div className="space-y-4"><h3 className="text-sm font-semibold">Абсолютная и относительная погрешность</h3><div className="grid grid-cols-2 gap-3"><div><label className="mb-1 block text-xs text-slate-500">Эталонное значение</label><input type="number" value={referenceValue} onChange={(e) => setReferenceValue(Number(e.target.value))} className="w-full rounded border border-slate-200 bg-slate-50 p-2" /></div><div><label className="mb-1 block text-xs text-slate-500">Измеренное значение</label><input type="number" value={measuredValue} onChange={(e) => setMeasuredValue(Number(e.target.value))} className="w-full rounded border border-slate-200 bg-slate-50 p-2" /></div></div></div><div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-blue-200 bg-blue-50 p-4"><span className="text-xs text-slate-500">Абсолютная</span><strong className="mt-1 block text-2xl text-blue-700">{absoluteError.toLocaleString("ru-RU", { maximumFractionDigits: 6 })}</strong></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><span className="text-xs text-slate-500">Относительная</span><strong className="mt-1 block text-2xl text-amber-700">{relativeError.toLocaleString("ru-RU", { maximumFractionDigits: 4 })}%</strong></div></div></div>
      )}

      {activeCalc === "machining" && (
        <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
          <div className="space-y-4"><div><span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase text-blue-700">ТТиТТ</span><h3 className="mt-2 text-sm font-semibold">Обороты шпинделя и машинное время</h3></div><div className="grid grid-cols-2 gap-3"><div><label className="mb-1 block text-xs text-slate-500">Скорость резания V, м/мин</label><input type="number" min="0" value={cuttingSpeed} onChange={(e) => setCuttingSpeed(Number(e.target.value))} className="w-full rounded border border-slate-200 bg-slate-50 p-2" /></div><div><label className="mb-1 block text-xs text-slate-500">Диаметр D, мм</label><input type="number" min="0" value={toolDiameter} onChange={(e) => setToolDiameter(Number(e.target.value))} className="w-full rounded border border-slate-200 bg-slate-50 p-2" /></div><div><label className="mb-1 block text-xs text-slate-500">Подача S, мм/об</label><input type="number" min="0" step="0.01" value={feedPerRev} onChange={(e) => setFeedPerRev(Number(e.target.value))} className="w-full rounded border border-slate-200 bg-slate-50 p-2" /></div><div><label className="mb-1 block text-xs text-slate-500">Длина обработки L, мм</label><input type="number" min="0" value={cutLength} onChange={(e) => setCutLength(Number(e.target.value))} className="w-full rounded border border-slate-200 bg-slate-50 p-2" /></div></div></div><div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-blue-200 bg-blue-50 p-4"><span className="text-xs text-slate-500">Расчётные обороты</span><strong className="mt-1 block text-2xl text-blue-700">{Math.round(spindleRpm)} об/мин</strong></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><span className="text-xs text-slate-500">Машинное время</span><strong className="mt-1 block text-2xl text-amber-700">{machiningMinutes.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} мин</strong></div><p className="col-span-2 text-xs leading-relaxed text-slate-500">Расчёт учебный. Ближайшую доступную частоту станка и режим выбирают с учётом материала, инструмента и паспорта оборудования.</p></div>
        </div>
      )}

      {activeCalc === "circuits" && (
        <div className="grid gap-6 md:grid-cols-2 animate-fade-in"><div className="space-y-4"><div><span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase text-blue-700">ТТиТТ</span><h3 className="mt-2 text-sm font-semibold">Последовательное и параллельное соединение</h3></div><div><label className="mb-1 block text-xs text-slate-500">Сопротивления через запятую, Ом</label><input value={resistanceValues} onChange={(e) => setResistanceValues(e.target.value)} className="w-full rounded border border-slate-200 bg-slate-50 p-2" /></div><div><label className="mb-1 block text-xs text-slate-500">Напряжение источника, В</label><input type="number" value={circuitVoltage} onChange={(e) => setCircuitVoltage(Number(e.target.value))} className="w-full rounded border border-slate-200 bg-slate-50 p-2" /></div><p className="text-xs text-slate-500">Распознано резисторов: {resistors.length}</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-blue-200 bg-blue-50 p-4"><span className="text-xs text-slate-500">Последовательно</span><strong className="mt-1 block text-2xl text-blue-700">{seriesResistance.toLocaleString("ru-RU", { maximumFractionDigits: 4 })} Ом</strong><span className="mt-2 block text-xs text-slate-500">I = {seriesResistance ? (circuitVoltage / seriesResistance).toLocaleString("ru-RU", { maximumFractionDigits: 4 }) : "—"} А</span></div><div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4"><span className="text-xs text-slate-500">Параллельно</span><strong className="mt-1 block text-2xl text-indigo-700">{parallelResistance.toLocaleString("ru-RU", { maximumFractionDigits: 4 })} Ом</strong><span className="mt-2 block text-xs text-slate-500">I = {parallelResistance ? (circuitVoltage / parallelResistance).toLocaleString("ru-RU", { maximumFractionDigits: 4 }) : "—"} А</span></div></div></div>
      )}

      {activeCalc === "recipe" && (
        <div className="grid gap-6 md:grid-cols-2 animate-fade-in"><div className="space-y-4"><div><span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold uppercase text-rose-700">Культура дома</span><h3 className="mt-2 text-sm font-semibold">Пересчёт рецептуры</h3></div><div className="grid grid-cols-2 gap-3"><div><label className="mb-1 block text-xs text-slate-500">Исходное число порций</label><input type="number" min="1" value={basePortions} onChange={(e) => setBasePortions(Number(e.target.value))} className="w-full rounded border border-slate-200 bg-slate-50 p-2" /></div><div><label className="mb-1 block text-xs text-slate-500">Нужное число порций</label><input type="number" min="0" value={targetPortions} onChange={(e) => setTargetPortions(Number(e.target.value))} className="w-full rounded border border-slate-200 bg-slate-50 p-2" /></div></div><div><label className="mb-1 block text-xs text-slate-500">Количество одного ингредиента</label><input type="number" min="0" value={ingredientAmount} onChange={(e) => setIngredientAmount(Number(e.target.value))} className="w-full rounded border border-slate-200 bg-slate-50 p-2" /></div></div><div className="rounded-xl border border-rose-200 bg-rose-50 p-5"><span className="text-xs text-slate-500">Коэффициент пересчёта</span><strong className="mt-1 block text-2xl text-rose-700">× {recipeFactor.toLocaleString("ru-RU", { maximumFractionDigits: 3 })}</strong><span className="mt-5 block text-xs text-slate-500">Новое количество ингредиента</span><strong className="mt-1 block text-3xl text-slate-900">{(ingredientAmount * recipeFactor).toLocaleString("ru-RU", { maximumFractionDigits: 2 })}</strong><p className="mt-4 text-xs text-slate-500">Единица сохраняется: граммы остаются граммами, миллилитры — миллилитрами.</p></div></div>
      )}

      {activeCalc === "sewing" && (
        <div className="grid gap-6 md:grid-cols-2 animate-fade-in"><div className="space-y-4"><div><span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold uppercase text-rose-700">Культура дома</span><h3 className="mt-2 text-sm font-semibold">Предварительный расчёт ткани</h3></div><div className="grid grid-cols-2 gap-3"><div><label className="mb-1 block text-xs text-slate-500">Раскладка по длине, см</label><input type="number" min="0" value={patternLength} onChange={(e) => setPatternLength(Number(e.target.value))} className="w-full rounded border border-slate-200 bg-slate-50 p-2" /></div><div><label className="mb-1 block text-xs text-slate-500">Ширина ткани, см</label><input type="number" min="0" value={fabricWidth} onChange={(e) => setFabricWidth(Number(e.target.value))} className="w-full rounded border border-slate-200 bg-slate-50 p-2" /></div><div><label className="mb-1 block text-xs text-slate-500">Запас, %</label><input type="number" min="0" value={fabricReserve} onChange={(e) => setFabricReserve(Number(e.target.value))} className="w-full rounded border border-slate-200 bg-slate-50 p-2" /></div><div><label className="mb-1 block text-xs text-slate-500">Цена за метр, ₽</label><input type="number" min="0" value={fabricPrice} onChange={(e) => setFabricPrice(Number(e.target.value))} className="w-full rounded border border-slate-200 bg-slate-50 p-2" /></div></div></div><div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-rose-200 bg-rose-50 p-4"><span className="text-xs text-slate-500">Ткань с запасом</span><strong className="mt-1 block text-2xl text-rose-700">{fabricMeters.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} м</strong></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><span className="text-xs text-slate-500">Стоимость ткани</span><strong className="mt-1 block text-2xl text-amber-700">{fabricCost.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽</strong></div><p className="col-span-2 text-xs leading-relaxed text-slate-500">Ширина указана для контроля исходных данных. Фактическую длину раскладки определяют после размещения деталей с учётом направления долевой нити, рисунка, ворса и парности.</p></div></div>
      )}

      {/* Content 1: Electrical */}
      {activeCalc === "electrical" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in">
          <div className="md:col-span-12 lg:col-span-7 space-y-4">
            <h3 className="font-sans font-semibold text-slate-850 text-sm">Параметры электрической цепи</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 font-mono uppercase mb-1">Напряжение U (В)</label>
                <input
                  type="number"
                  value={volts}
                  onChange={(e) => setVolts(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-mono uppercase mb-1">Сила тока I (А)</label>
                <input
                  type="number"
                  value={amps}
                  onChange={(e) => setAmps(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-mono uppercase mb-1">Сопротивление R (Ом)</label>
                <input
                  type="number"
                  value={ohms}
                  onChange={(e) => setOhms(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-mono uppercase mb-1">Мощность P (Вт)</label>
                <input
                  type="number"
                  value={watts}
                  onChange={(e) => setWatts(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {electricalError && (
              <div className="p-2 border border-rose-200 bg-rose-50 text-rose-700 rounded text-xs">
                {electricalError}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <button onClick={() => calculateOhmLaw("u")} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold rounded text-blue-700 transition cursor-pointer">
                Найти U (I * R)
              </button>
              <button onClick={() => calculateOhmLaw("i")} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold rounded text-blue-700 transition cursor-pointer">
                Найти I (U / R)
              </button>
              <button onClick={() => calculateOhmLaw("r")} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold rounded text-blue-700 transition cursor-pointer">
                Найти R (U / I)
              </button>
              <button onClick={() => calculateOhmLaw("p")} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded text-blue-800 transition cursor-pointer">
                Найти Мощность P
              </button>
            </div>
          </div>

          <div className="md:col-span-12 lg:col-span-5 bg-slate-50 border border-slate-200 rounded p-4 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-slate-500 tracking-wider block uppercase mb-2">Формульный помощник</span>
              <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                На олимпийском туре всегда используются условные обозначения формул в едином круге:
              </p>
              <ul className="space-y-1 text-slate-500 text-xs font-mono">
                <li>• Закон Ома: <span className="text-blue-600 font-semibold">I = U / R</span></li>
                <li>• Напряжение: <span className="text-blue-600 font-semibold">U = I * R</span></li>
                <li>• Мощность: <span className="text-amber-600 font-semibold">P = U * I = I² * R</span></li>
                <li>• Сопротивление: <span className="text-blue-600 font-semibold">R = U / I</span></li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="bg-white border border-slate-100 p-2.5 rounded text-[11px] text-slate-500 flex items-start gap-2 shadow-sm">
                <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Всегда приводите физические параметры перед вычислением в СИ (напряжение в Вольты, ток в Амперы).</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content 2: Mechanical */}
      {activeCalc === "mechanical" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in">
          <div className="md:col-span-12 lg:col-span-7 space-y-4">
            <h3 className="font-sans font-semibold text-slate-850 text-sm">Зубчатая или ременная передача редуктора</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 font-mono mb-1">Зубья ведущей шестерни Z1</label>
                <input
                  type="number"
                  value={zDriver}
                  onChange={(e) => setZDriver(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-mono mb-1">Зубья ведомой шестерни Z2</label>
                <input
                  type="number"
                  value={zDriven}
                  onChange={(e) => setZDriven(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-mono mb-1">Входная скорость (об/мин)</label>
                <input
                  type="number"
                  value={inputRPM}
                  onChange={(e) => setInputRPM(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-mono mb-1">Коэффициент потерь (КПД)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={efficiency}
                  onChange={(e) => setEfficiency(parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-800"
                />
              </div>
            </div>

            <div className="border border-slate-200 bg-slate-50 rounded p-4">
              <span className="font-mono text-xs text-slate-550 block mb-2 font-medium">Расчетная модель передачи:</span>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 bg-white border border-slate-200/80 rounded shadow-sm">
                  <span className="text-[9px] text-slate-500 block font-mono">ПЕРЕДАТОЧНОЕ ЧИСЛО</span>
                  <span className="text-base font-bold text-blue-600 font-mono">{gearRatio.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200/80 rounded shadow-sm">
                  <span className="text-[9px] text-slate-500 block font-mono">ВЫХОДНЫЕ ОБОРОТЫ</span>
                  <span className="text-base font-bold text-amber-600 font-mono">{Math.round(outputRPM)} об/м</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200/80 rounded shadow-sm">
                  <span className="text-[9px] text-slate-500 block font-mono">КОЭФ. МОМЕНТА</span>
                  <span className="text-base font-bold text-emerald-600 font-mono">{torqueMultiplier.toFixed(2)}x</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-12 lg:col-span-5 bg-slate-50 border border-slate-200 rounded p-4 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-slate-500 tracking-wider block uppercase mb-2">Задача на кинематику</span>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                В олимпиадах вы всегда перемножаете передаточное число пар колес по цепочке для многоступенчатой системы:
              </p>
              <div className="p-2 bg-white border border-slate-100 rounded font-mono text-[10px] text-slate-550 shadow-sm text-center">
                i = (Z2 / Z1) * (Z4 / Z3) * ...
              </div>
              <p className="text-xs text-slate-550 italic mt-2">
                Замедляющие редукторы имеют i &gt; 1, увеличивая выходной крутящий момент.
              </p>
            </div>
            <div className="mt-4">
              <div className="p-2.5 bg-blue-50 border border-blue-100 rounded text-[11px] text-slate-600 font-sans leading-relaxed">
                💡 Обороты ведомого вала падают пропорционально передаточному соотношению, в то время как момент мощности возрастает.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content 3: Hardness */}
      {activeCalc === "hardness" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in">
          <div className="md:col-span-12 lg:col-span-7 space-y-4">
            <h3 className="font-sans font-semibold text-slate-850 text-sm">Сравнительный коэффициент твёрдости материалов</h3>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 font-mono mb-1">Твёрдость по шкале ({hardnessScale})</label>
                <input
                  type="number"
                  value={hardnessVal}
                  onChange={(e) => setHardnessVal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-mono mb-1">Выбрать шкалу</label>
                <select
                  value={hardnessScale}
                  onChange={(e) => setHardnessScale(e.target.value as "HB" | "HRC" | "HV")}
                  className="bg-slate-50 border border-slate-200 text-slate-800 rounded p-2 text-sm focus:outline-none focus:bg-white cursor-pointer"
                >
                  <option value="HB">HB (по Бринеллю) - шарик</option>
                  <option value="HRC">HRC (по Роквеллу) - конус</option>
                  <option value="HV">HV (по Виккерсу) - пирамида</option>
                </select>
              </div>
            </div>

            <div className="border border-slate-200 bg-slate-50 rounded p-4 space-y-3">
              <span className="font-mono text-[10px] text-slate-550 tracking-wider block uppercase mb-1">Эквивалентные величины на пробах</span>
              <div className="divider border-slate-200 border-t my-1"></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="bg-white border border-slate-200/80 p-2.5 rounded shadow-sm">
                  <span className="text-[9px] text-slate-505 block font-mono">ШКАЛА БРИНЕЛЛЯ (HB)</span>
                  <span className="text-xs sm:text-sm font-bold text-blue-600 block mt-1">{currentConversions.HB}</span>
                </div>
                <div className="bg-white border border-slate-200/80 p-2.5 rounded shadow-sm">
                  <span className="text-[9px] text-slate-505 block font-mono">ШКАЛА РОКВЕЛЛА (HRC)</span>
                  <span className="text-xs sm:text-sm font-bold text-amber-600 block mt-1">{currentConversions.HRC}</span>
                </div>
                <div className="bg-white border border-slate-200/80 p-2.5 rounded shadow-sm">
                  <span className="text-[9px] text-slate-505 block font-mono">ШКАЛА ВИККЕРСА (HV)</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-600 block mt-1">{currentConversions.HV}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-12 lg:col-span-5 bg-slate-50 border border-slate-200 rounded p-4 flex flex-col justify-between text-xs text-slate-600 leading-relaxed shadow-sm">
            <div>
              <span className="font-mono text-[10px] text-slate-500 tracking-wider block uppercase mb-2 font-medium">Назначение шкал по ГОСТУ</span>
              <div className="space-y-3">
                <p>
                  <strong className="text-blue-600 font-semibold block">Бринелль (HB):</strong> Измеряется закаленным шариком. Идеален для пластмасс, дерева (сосна: 2.5 HB, ясень: 4.15 HB) и мягких сплавов (латунь).
                </p>
                <p>
                  <strong className="text-amber-600 font-semibold block">Роквелл (HRC):</strong> Измеряется алмазным конусом с углом 120°. Подходит для режущих кромок резцов, фрез из быстрорежущей стали Р18, Р6М5.
                </p>
                <p>
                  <strong className="text-emerald-600 block font-semibold">Виккерс (HV):</strong> Прецизионное измерение алмазной пирамидкой. Применяется для тончайших гальванических покрытий на микронном уровне.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
