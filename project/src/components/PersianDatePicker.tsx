import { useState } from "react"
import dayjs from "dayjs"
import jalaliday from "jalaliday"

dayjs.extend(jalaliday)

const months = [
  "فروردین","اردیبهشت","خرداد","تیر",
  "مرداد","شهریور","مهر","آبان",
  "آذر","دی","بهمن","اسفند"
]

const weekDays = ["ش","ی","د","س","چ","پ","ج"]

export default function PersianDatePicker({ value, onChange }: any) {

  const today = dayjs().calendar("jalali")

  const [open,setOpen] = useState(false)
  const [current,setCurrent] = useState(today)

  const selectDay = (day:number) => {

    const jDate = current.date(day)

    const gDate = jDate.calendar("gregory").format("YYYY-MM-DD")

    onChange(gDate)

    setOpen(false)
  }

  const startDay = current.startOf("month").day()

  const daysInMonth = current.daysInMonth()

  const days = []

  for(let i=0;i<startDay;i++){
    days.push(null)
  }

  for(let d=1;d<=daysInMonth;d++){
    days.push(d)
  }

  const nextMonth = () => {
    setCurrent(current.add(1,"month"))
  }

  const prevMonth = () => {
    setCurrent(current.subtract(1,"month"))
  }

  return (
    <div className="relative w-full">

      <input
        readOnly
        onClick={()=>setOpen(!open)}
        value={
          value
            ? dayjs(value).calendar("jalali").format("YYYY/MM/DD")
            : ""
        }
        placeholder="انتخاب تاریخ"
        className="w-full border rounded-xl px-4 py-3 cursor-pointer"
      />

      {open && (

        <div className="absolute z-50 mt-2 bg-white shadow-xl rounded-2xl p-4 w-80">

          <div className="flex justify-between items-center mb-3">

            <button onClick={nextMonth}>‹</button>

            <div className="font-semibold">
              {months[current.month()]} {current.year()}
            </div>

            <button onClick={prevMonth}>›</button>

          </div>

          <div className="grid grid-cols-7 text-center text-sm mb-2">

            {weekDays.map(d => (
              <div key={d}>{d}</div>
            ))}

          </div>

          <div className="grid grid-cols-7 gap-1 text-center">

            {days.map((day,i)=>{

              if(!day){
                return <div key={i}></div>
              }

              return (

                <button
                  key={i}
                  onClick={()=>selectDay(day)}
                  className="p-2 rounded-lg hover:bg-blue-100"
                >
                  {day}
                </button>

              )

            })}

          </div>

        </div>

      )}

    </div>
  )
}
