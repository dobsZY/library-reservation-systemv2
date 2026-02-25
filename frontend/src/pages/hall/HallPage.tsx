import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Clock, Filter, Check } from 'lucide-react';
import { hallsApi } from '../../api/halls';
import { reservationsApi } from '../../api/reservations';
import type { CreateReservationDto } from '../../api/reservations';
import { Card, Button, OccupancyBar } from '../../components/common';
import { TableMap } from '../../components/hall/TableMap';
import { getTimeSlots, formatTime } from '../../utils/date';
import { useAppStore } from '../../stores/useAppStore';
import type { TableFeature } from '../../types';

export const HallPage: React.FC = () => {
  const { hallId } = useParams<{ hallId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { selectedTableId, setSelectedTableId, setError, setSuccessMessage } = useAppStore();

  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(2);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['hall-availability', hallId],
    queryFn: () => hallsApi.getAvailability(hallId!),
    enabled: !!hallId,
    refetchInterval: 30000,
  });

  const createReservation = useMutation({
    mutationFn: (dto: CreateReservationDto) => reservationsApi.create(dto),
    onSuccess: () => {
      setSuccessMessage('Rezervasyon başarıyla oluşturuldu!');
      queryClient.invalidateQueries({ queryKey: ['hall-availability'] });
      navigate('/my-reservation');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Rezervasyon oluşturulamadı');
    },
  });

  const timeSlots = useMemo(() => getTimeSlots(8, 23), []);

  const selectedTable = useMemo(() => {
    if (!selectedTableId || !data) return null;
    return data.tables.find((t) => t.table.id === selectedTableId);
  }, [selectedTableId, data]);

  const filteredTables = useMemo(() => {
    if (!data) return [];
    if (selectedFeatures.length === 0) return data.tables;
    
    return data.tables.filter((t) => 
      selectedFeatures.every((featureId) => 
        t.table.features.some((f) => f.id === featureId)
      )
    );
  }, [data, selectedFeatures]);

  const handleReservation = () => {
    if (!selectedTableId || !selectedTime) {
      setError('Lütfen masa ve saat seçin');
      return;
    }

    const today = new Date();
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);

    createReservation.mutate({
      tableId: selectedTableId,
      startTime: startTime.toISOString(),
      durationHours: selectedDuration,
    });
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
  };

  // Tüm benzersiz özellikleri topla
  const allFeatures = useMemo(() => {
    if (!data) return [];
    const featuresMap = new Map<string, TableFeature>();
    data.tables.forEach((t) => {
      t.table.features.forEach((f) => {
        if (!featuresMap.has(f.id)) {
          featuresMap.set(f.id, f);
        }
      });
    });
    return Array.from(featuresMap.values()).sort((a, b) => a.displayOrder - b.displayOrder);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-selcuk-blue border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500">Salon bulunamadı</p>
        <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">
          Ana Sayfaya Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-32">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900">{data.hall.name}</h1>
            <p className="text-sm text-gray-500">{data.hall.floor}. Kat</p>
          </div>
          <OccupancyBar 
            percentage={data.statistics.occupancyRate} 
            size="sm" 
            showLabel={false}
            className="w-24"
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Zaman Seçimi */}
        <Card>
          <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <Clock size={18} />
            Zaman Seçimi
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Başlangıç Saati</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-selcuk-blue focus:border-transparent"
              >
                <option value="">Saat seçin</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Süre</label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-selcuk-blue focus:border-transparent"
              >
                <option value={1}>1 Saat</option>
                <option value={2}>2 Saat</option>
                <option value={3}>3 Saat</option>
              </select>
            </div>
          </div>

          {selectedTime && (
            <p className="text-sm text-gray-600">
              📅 Bugün, {selectedTime} - {
                `${(parseInt(selectedTime.split(':')[0]) + selectedDuration).toString().padStart(2, '0')}:00`
              } ({selectedDuration} saat)
            </p>
          )}
        </Card>

        {/* Filtreler */}
        {allFeatures.length > 0 && (
          <Card>
            <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Filter size={18} />
              Filtreler
            </h3>
            <div className="flex flex-wrap gap-2">
              {allFeatures.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => toggleFeature(feature.id)}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-all ${
                    selectedFeatures.includes(feature.id)
                      ? 'bg-selcuk-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{feature.icon}</span>
                  <span>{feature.name}</span>
                  {selectedFeatures.includes(feature.id) && <Check size={14} />}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Masa Haritası */}
        <Card padding="sm">
          <TableMap
            tables={filteredTables}
            layoutWidth={data.hall.layoutWidth}
            layoutHeight={data.hall.layoutHeight}
            selectedTableId={selectedTableId}
            onTableSelect={setSelectedTableId}
            scale={0.6}
          />
        </Card>

        {/* İstatistikler */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.statistics.available}</div>
            <div className="text-xs text-gray-500">Boş</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-red-600">{data.statistics.occupied}</div>
            <div className="text-xs text-gray-500">Dolu</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-gray-700">{data.statistics.total}</div>
            <div className="text-xs text-gray-500">Toplam</div>
          </Card>
        </div>
      </main>

      {/* Alt Rezervasyon Paneli */}
      {selectedTable && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-selcuk-blue shadow-2xl p-4 z-30">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Masa {selectedTable.table.tableNumber}
                </h3>
                <div className="flex gap-1 mt-1">
                  {selectedTable.table.features.map((f) => (
                    <span key={f.id} title={f.name} className="text-sm">
                      {f.icon}
                    </span>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTableId(null)}
              >
                İptal
              </Button>
            </div>
            
            <Button
              className="w-full"
              size="lg"
              onClick={handleReservation}
              isLoading={createReservation.isPending}
              disabled={!selectedTime}
            >
              🎫 Rezervasyon Yap
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

