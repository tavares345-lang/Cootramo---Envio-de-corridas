
import React, { useState, useMemo } from 'react';
import { useAppState } from '../hooks/useAppState';
import { RideStatus, Ride } from '../types';
import { XCircleIcon, PrinterIcon, FileTextIcon, MapPinIcon, ClockIcon, DollarSignIcon, UserIcon } from './Icons';

interface ReportsViewProps {
    onClose: () => void;
}

const ReportsView: React.FC<ReportsViewProps> = ({ onClose }) => {
    const { state } = useAppState();
    
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState<RideStatus | 'ALL'>('ALL');
    const [driverFilter, setDriverFilter] = useState<string>('ALL');

    const filteredRides = useMemo(() => {
        return state.rides.filter(ride => {
            // Filter by Date
            if (startDate && ride.pickupDate < startDate) return false;
            if (endDate && ride.pickupDate > endDate) return false;
            
            // Filter by Status
            if (statusFilter !== 'ALL' && ride.status !== statusFilter) return false;
            
            // Filter by Driver
            if (driverFilter !== 'ALL') {
                const assignedId = ride.assignedDriverId || ride.offeredToDriverId;
                if (assignedId?.toString() !== driverFilter) return false;
            }
            
            return true;
        }).sort((a, b) => b.pickupDate.localeCompare(a.pickupDate) || b.time.localeCompare(a.time));
    }, [state.rides, startDate, endDate, statusFilter, driverFilter]);

    const totalFare = useMemo(() => {
        return filteredRides.reduce((acc, ride) => acc + ride.fare, 0);
    }, [filteredRides]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 overflow-y-auto">
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl border border-slate-700 flex flex-col max-h-[90vh]">
                {/* Header - Hidden on Print */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-center print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-500/20 p-2 rounded-lg">
                            <FileTextIcon className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Relatórios de Corridas</h2>
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Filtre e imprima o histórico operacional</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <XCircleIcon className="w-8 h-8" />
                    </button>
                </div>

                {/* Filters - Hidden on Print */}
                <div className="p-6 bg-slate-800/50 border-b border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Data Inicial</label>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Data Final</label>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                        >
                            <option value="ALL">Todos os Status</option>
                            <option value={RideStatus.WAITING}>Aguardando</option>
                            <option value={RideStatus.IN_PROGRESS}>Em Curso</option>
                            <option value={RideStatus.COMPLETED}>Finalizadas</option>
                            <option value={RideStatus.SCHEDULED}>Agendadas</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Unidade</label>
                        <select 
                            value={driverFilter} 
                            onChange={(e) => setDriverFilter(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                        >
                            <option value="ALL">Todas as Unidades</option>
                            {state.drivers.map(d => (
                                <option key={d.id} value={d.id.toString()}>Un. {d.unitNumber} - {d.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Report Content */}
                <div className="flex-grow overflow-y-auto p-6 custom-scrollbar bg-white print:bg-white print:p-0">
                    {/* Print Header */}
                    <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">COOPTAXI - RELATÓRIO OPERACIONAL</h1>
                                <p className="text-slate-600 font-bold">Emitido em: {new Date().toLocaleString('pt-BR')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-500 uppercase">Filtros Aplicados:</p>
                                <p className="text-xs text-slate-700">
                                    {startDate || 'Início'} até {endDate || 'Fim'} • {statusFilter === 'ALL' ? 'Todos Status' : statusFilter}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 print:grid-cols-3">
                        <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 print:border-slate-300">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total de Corridas</p>
                            <p className="text-3xl font-black text-slate-900">{filteredRides.length}</p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 print:border-emerald-300">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Valor Total Estimado</p>
                            <p className="text-3xl font-black text-emerald-700">R$ {totalFare.toFixed(2).replace('.', ',')}</p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 print:border-amber-300">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Média por Corrida</p>
                            <p className="text-3xl font-black text-amber-700">
                                R$ {filteredRides.length > 0 ? (totalFare / filteredRides.length).toFixed(2).replace('.', ',') : '0,00'}
                            </p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <th className="py-3 px-2">Data/Hora</th>
                                    <th className="py-3 px-2">Unidade</th>
                                    <th className="py-3 px-2">Embarque / Destino</th>
                                    <th className="py-3 px-2">Status</th>
                                    <th className="py-3 px-2 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-800">
                                {filteredRides.map(ride => {
                                    const driver = state.drivers.find(d => d.id === (ride.assignedDriverId || ride.offeredToDriverId));
                                    return (
                                        <tr key={ride.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors print:break-inside-avoid">
                                            <td className="py-4 px-2 align-top">
                                                <p className="font-bold text-sm">{new Date(ride.pickupDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                                <p className="text-xs text-slate-500">{ride.time}</p>
                                            </td>
                                            <td className="py-4 px-2 align-top">
                                                {driver ? (
                                                    <div>
                                                        <p className="font-bold text-sm">Un. {driver.unitNumber}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase truncate w-24">{driver.name}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-400 italic">Não atribuída</p>
                                                )}
                                            </td>
                                            <td className="py-4 px-2 align-top max-w-xs">
                                                <div className="flex items-start gap-1.5 mb-1">
                                                    <MapPinIcon className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                                                    <p className="text-xs font-medium">{ride.pickup}</p>
                                                </div>
                                                <div className="flex items-start gap-1.5">
                                                    <MapPinIcon className="w-3 h-3 text-rose-500 mt-0.5 shrink-0" />
                                                    <p className="text-xs font-medium">{ride.destination}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2 align-top">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                                    ride.status === RideStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' :
                                                    ride.status === RideStatus.IN_PROGRESS ? 'bg-sky-100 text-sky-700' :
                                                    ride.status === RideStatus.SCHEDULED ? 'bg-purple-100 text-purple-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {ride.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2 align-top text-right font-black text-slate-900">
                                                R$ {ride.fare.toFixed(2).replace('.', ',')}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredRides.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-slate-400 italic">
                                            Nenhuma corrida encontrada com os filtros selecionados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Print Footer */}
                    <div className="hidden print:block mt-12 pt-8 border-t border-slate-200 text-center">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Fim do Relatório Operacional - COOPTAXI</p>
                    </div>
                </div>

                {/* Footer Actions - Hidden on Print */}
                <div className="p-6 border-t border-slate-700 flex justify-end gap-3 print:hidden">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
                    >
                        Fechar
                    </button>
                    <button 
                        onClick={handlePrint}
                        disabled={filteredRides.length === 0}
                        className="px-8 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-black rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform active:scale-95"
                    >
                        <PrinterIcon className="w-5 h-5" />
                        IMPRIMIR RELATÓRIO
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:block, .print\\:block * {
                        visibility: visible;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .fixed {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        background: white !important;
                        padding: 0 !important;
                        overflow: visible !important;
                    }
                    .bg-slate-800 {
                        background: white !important;
                        box-shadow: none !important;
                        border: none !important;
                        max-height: none !important;
                    }
                    .overflow-y-auto {
                        overflow: visible !important;
                    }
                    table {
                        page-break-inside: auto;
                    }
                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                }
            `}} />
        </div>
    );
};

export default ReportsView;
