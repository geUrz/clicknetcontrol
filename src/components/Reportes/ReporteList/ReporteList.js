import { ListEmpty, Loading } from '@/components/Layouts'
import { map, size } from 'lodash'
import { FaClipboard } from 'react-icons/fa'
import { BasicModal } from '@/layouts'
import { ReporteDetalles } from '../ReporteDetalles'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Form, FormField, FormGroup, Label } from 'semantic-ui-react'
import { formatDate, formatDateInc } from '@/helpers'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import styles from './ReporteList.module.css'

export function ReporteList(props) {

  const { reload, onReload, reportes, onToastSuccessMod, onToastSuccessDel } = props

  const { loading } = useAuth()

  const [showDetalles, setShowDetalles] = useState(false)
  const [reporteSeleccionada, setReporteSeleccionada] = useState(null)
  const [showLoading, setShowLoading] = useState(true)

  const onOpenDetalles = (reporte) => {
    setReporteSeleccionada(reporte)
    setShowDetalles(true)
  }

  const onCloseDetalles = () => {
    setReporteSeleccionada(null)
    setShowDetalles(false)
  }

  const [filterEstado, setFilterEstado] = useState('')
  const [filterFecha, setFilterFecha] = useState(null)

  const filteredReporte = (reportes || []).filter((reporte) => {
    return (
      (filterFecha === null || reporte.date === formatDateInc(filterFecha))
    )
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false)
    }, 800) 

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <Loading size={45} loading={0} />
  }

  return (

    <>

      <div className={styles.filters}>

        <h1>Buscar por:</h1>

        <Form>
          <FormGroup>
            <Label className={styles.label}>Fecha</Label>
            <FormField>
              <DatePicker
                selected={filterFecha}
                onChange={(date) => setFilterFecha(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/aaaa"
                locale="es"
                isClearable
                showPopperArrow={false}
                popperPlacement="bottom"
              />
            </FormField>
          </FormGroup>
        </Form>
      </div>

      {showLoading ? (
        <Loading size={45} loading={1} />
      ) : (
        size(filteredReporte) === 0 ? (
          <ListEmpty />
        ) : (
          <div className={styles.main}>
            {map(filteredReporte, (reporte) => (
                <div key={reporte.id} className={styles.section} onClick={() => onOpenDetalles(reporte)}>
                  <div>
                    <div className={styles.column1}>
                      <FaClipboard />
                    </div>
                    <div className={styles.column2}>
                      <div >
                        <h1>Reporte</h1>
                        <h2>{reporte.reporte}</h2>
                      </div>
                      <div >
                        <h1>Fecha</h1>
                        <h2>{formatDate(reporte.date)}</h2>
                      </div>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        )
      )}

      <BasicModal title='detalles del reporte' show={showDetalles} onClose={onCloseDetalles}>
        {reporteSeleccionada && (
          <ReporteDetalles
            reload={reload}
            onReload={onReload}
            reporte={reporteSeleccionada}
            onOpenCloseDetalles={onCloseDetalles}
            onToastSuccessMod={onToastSuccessMod}
            onToastSuccessDel={onToastSuccessDel}
          />
        )}
      </BasicModal>

    </>

  )
}