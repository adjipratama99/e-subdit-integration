import { AbsensiType, Penanganan, Personel } from "@/types/general";
import { clsx, type ClassValue } from "clsx"
import { formatInTimeZone } from "date-fns-tz";
import { twMerge } from "tailwind-merge"
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  if (!name) return "";

  return name
      .trim()
      .split(/\s+/) // split by space
      .map(part => part[0].toUpperCase())
      .join("");
}

export const requiredKey = async (keys: string[], body: Record<string, any>): Promise<boolean> => {
  return keys.every((key) => body.hasOwnProperty(key) && body[key] !== undefined && body[key] !== null)
}

export const formatIp = (xForwardedFor: string) => {
  const regex = /[^:f/]+/g
  const results = xForwardedFor.match(regex) as string[]
  return results[0]
}

export function groupByKey(array: {[key: string]: any}[], key: string) {
  return array.reduce((result, item) => {
      const group = item[key] ?? 'undefined';
      if (!result[group.toLowerCase()]) {
          result[group.toLowerCase()] = [];
      }
      result[group.toLowerCase()].push(item);
      return result;
  }, {});
}

export function generateConfigTablePdf(res: any, typeData: "absensi" | "personnel" | "lp-li") {
    let header = [[]] as any[][];
    let result = [[]] as any[][];

    switch(typeData) {
      case "absensi":
        header = [[
            { content: "No", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] }, rowSpan: 2 },
            { content: "NAMA", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] }, rowSpan: 2 },
            { content: "PANGKAT / NRP", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] }, rowSpan: 2 },
            { content: "JABATAN", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] }, rowSpan: 2 },
            { content: "JAM KEHADIRAN", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0], halign: "center" }, colSpan: 2 },
            { content: "TANDA TANGAN", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0], halign: "center" }, colSpan: 2 }
        ],[
            { content: "DATANG", styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
            { content: "PULANG", styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
            { content: "DATANG", styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
            { content: "PULANG", styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
        ]]

        result = (res as AbsensiType[]).map((absensi, index) => {
            return [
                index + 1,
                absensi.personel.nama,
                `${ absensi.personel.pangkat }\n${ absensi.personel.nrp }`,
                absensi.personel.jabatan,
                `${ formatInTimeZone(absensi.jam_datang, 'UTC', 'yyyy-MM-dd') }\n${ formatInTimeZone(absensi.jam_datang, 'UTC', 'HH:mm') }`,
                `${ formatInTimeZone(absensi.jam_pulang, 'UTC', 'yyyy-MM-dd') }\n${ formatInTimeZone(absensi.jam_pulang, 'UTC', 'HH:mm') }`,
                "",
                ""
            ]
        })
        break;
      case "personnel":
        header = [[
            { content: "No", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] } },
            { content: "NAMA", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] } },
            { content: "PANGKAT / NRP", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] } },
            { content: "JABATAN", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] } },
            { content: "PENDIDIKAN UMUM", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] } },
            { content: "PENDIDIKAN KEPOLISIAN", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] } },
            { content: "PENDIDIKAN KEJURUAN", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] } },
            { content: "PENYIDIK / PENYIDIK PEMBANTU", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] } },
            { content: "ADA / TIDAK ADA SKEP", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] } },
            { content: "SERTIFIKASI / BELUM SERTIFIKASI", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] } }
        ]]

        const data = (res as Personel[]).map(person => {
            const { pendidikan, ...personWithoutPendidikan } = person;
            return {
                ...personWithoutPendidikan,
                ...groupByKey(pendidikan, "jenis")
            }
        })

        result = data.map((personel, index) => {
          return [
              index + 1,
              personel.nama,
              `${ personel.pangkat }\n${ personel.nrp }`,
              personel.jabatan,
              (personel.umum && personel.umum.length
                  ? personel.umum.map(umum => `${umum.nama_sekolah}    ${umum.tahun_mulai}`)
                  : []
              ).join('\n'),
              (personel.kepolisian && personel.kepolisian.length
                  ? personel.kepolisian.map(kepolisian => `${kepolisian.nama_sekolah} ${kepolisian.tahun_mulai}`)
                  : []
              ).join('\n'),
              (personel.kejuruan && personel.kejuruan.length
                  ? personel.kejuruan.map(kejuruan => `${kejuruan.nama_sekolah} ${kejuruan.tahun_mulai}`)
                  : []
              ).join('\n'),
              personel.skep,
              personel.certified ? "Sudah" : "",
          ]
        })
        break;
      case "lp-li":
        header = [[
            { content: "No", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] } },
            { content: "LAPORAN POLISI", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] } },
            { content: "URAIAN", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] } },
            { content: "HAMBATAN", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] } },
            { content: "RTL", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] } },
            { content: "PERKEMBANGAN / KETERANGAN", styles: { fillColor: [254, 230, 133], textColor: [0, 0, 0] } }
        ]]

        result = (res as Penanganan[]).map((laporan, index) => {
          return [
            index + 1,
            `${ laporan.nomor }, tanggal ${ formatInTimeZone(laporan.tanggal, 'UTC', 'dd MMMM yyyy', { locale: id }) }\n\n(${ laporan.judul })`,
            `Kronologis:\n
              ${ laporan.kronologis }\n
              Persangkaan Pasal:\n
              ${(laporan.pasal && laporan.pasal.length
                ? laporan.pasal.map(pasal => `${pasal}`)
                : []
              ).join(',\b')}\n\n
              Terlapor:\n
              ${(laporan.terlapor && laporan.terlapor.length
                ? laporan.terlapor.map(terlapor => `${terlapor}`)
                : []
              ).join(',\b')}\n\n
              Pelapor:\n
              ${(laporan.pelapor && laporan.pelapor.length
                ? laporan.pelapor.map(pelapor => `${pelapor}`)
                : []
              ).join(',\b')}\n
              Saksi:\n
              ${(laporan.saksi && laporan.saksi.length
                ? laporan.saksi.map(saksi => `${saksi}`)
                : []
              ).join(',\b')}\n\n
            `,
            laporan.catatan_hambatan,
            laporan.rtl,
            laporan.keterangan
          ]
        })
        break;
    }

    return {
      header,
      result
    }
}