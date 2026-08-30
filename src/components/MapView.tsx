// 下部タブ「マップ」の中身。
// Leaflet + OpenStreetMap（APIキー不要）で、店舗の位置をピンで表示する。
// ピンをタップすると店舗名と所要時間（登録データの値）が出る。
//
// 座標がまだ入っていない場合（add_store_coords.sql 未実行）は、
// 地図を出さずに実行手順の案内を表示する。

import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Store } from '../types'

type Props = {
  stores: Store[]
}

/** 位置が登録済みの店舗（lat / lng が数値） */
type LocatedStore = Store & { lat: number; lng: number }

const KYOTO_CENTER: [number, number] = [35.021, 135.768]

// 画像ファイルを使わず、SVG でピンを描く（バンドラのアイコン読み込み問題を回避）。
const pinIcon = L.divIcon({
  className: '',
  html:
    '<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M14 0C6.27 0 0 6.1 0 13.6 0 23.2 14 36 14 36s14-12.8 14-22.4C28 6.1 21.73 0 14 0z" fill="#059669"/>' +
    '<circle cx="14" cy="13.5" r="5" fill="#ffffff"/></svg>',
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -34],
})

/** 店舗が全部見えるように地図の表示範囲を合わせる */
function FitToStores({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 15)
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40] })
    }
  }, [map, points])
  return null
}

export function MapView({ stores }: Props) {
  const located = useMemo<LocatedStore[]>(
    () =>
      stores.filter(
        (store): store is LocatedStore =>
          typeof store.lat === 'number' && typeof store.lng === 'number',
      ),
    [stores],
  )
  const points = useMemo<[number, number][]>(
    () => located.map((store) => [store.lat, store.lng]),
    [located],
  )

  if (located.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-8 text-center">
        <p className="text-base font-bold text-gray-700">
          店舗の位置情報がまだありません
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          <code className="rounded bg-gray-100 px-1">
            supabase/add_store_coords.sql
          </code>
          <br />
          を Supabase の SQL Editor で実行すると、ここに地図が表示されます。
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs leading-relaxed text-gray-400">
        ピンをタップすると店舗名と所要時間が出ます。所要時間は登録データの値で、
        地図から計算した距離ではありません。
      </p>

      <div className="h-[65vh] min-h-[360px] w-full overflow-hidden rounded-2xl border border-gray-200">
        <MapContainer
          center={KYOTO_CENTER}
          zoom={13}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitToStores points={points} />
          {located.map((store) => (
            <Marker
              key={store.id}
              position={[store.lat, store.lng]}
              icon={pinIcon}
            >
              <Popup>
                <span className="block text-sm font-bold">{store.name}</span>
                <span className="mt-1 block text-xs text-gray-600">
                  徒歩 {store.walkMinutes}分 ／ 自転車 {store.bikeMinutes}分
                </span>
                {store.note !== '' && (
                  <span className="mt-1 block text-xs text-gray-500">
                    {store.note}
                  </span>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {stores.length > located.length && (
        <p className="mt-3 text-xs text-gray-400">
          ※位置情報が未登録の店舗は地図に出ません（
          {stores.length - located.length}件）。
        </p>
      )}
      <p className="mt-1 text-xs text-gray-400">
        地図の座標はデモ用のおおよその位置です（正確な店舗所在地ではありません）。
      </p>
    </div>
  )
}
