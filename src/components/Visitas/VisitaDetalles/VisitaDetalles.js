import { IconClose, Confirm, DatosRes, ToastSuccessQR } from '@/components/Layouts';
import { formatDate } from '@/helpers';
import { BasicModal, ModalImg } from '@/layouts';
import { FaCheck, FaDownload, FaEdit, FaImage, FaInfoCircle, FaShareAlt, FaTimes, FaTrash } from 'react-icons/fa';
import { useState } from 'react';
import { VisitaEditForm } from '../VisitaEditForm/VisitaEditForm';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Image as ImageSemantic } from 'semantic-ui-react';
import styles from './VisitaDetalles.module.css';

export function VisitaDetalles(props) {
  const { reload, onReload, visita, onOpenCloseDetalles, onToastSuccessVisitaMod, onToastSuccessVisitaDel } = props;
  const { user } = useAuth()

  const [showEditVisita, setShowEditVisita] = useState(false)
  const [showRes, setShowRes] = useState(false)
  const [showTipoAcc, setShowTipoAcc] = useState(false)
  const [showConfirmDel, setShowConfirmDel] = useState(false)
  const [showDownQR, setShowDownQR] = useState(false)
  const [showImg, setShowImg] = useState(false)
  const [selectedImg, setSelectedImg] = useState(null)

  const onOpenEditVisita = () => setShowEditVisita((prevState) => !prevState)
  const onOpenCloseRes = () => setShowRes((prevState) => !prevState)
  const onOpenCloseTipoAcc = () => setShowTipoAcc((prevState) => !prevState)
  const onOpenCloseConfirmDel = () => setShowConfirmDel((prevState) => !prevState)
  const onToastSuccessDownloadQR = () => setShowDownQR((prevState) => !prevState)

  const openImg = (imgUrl) => {
    setSelectedImg(imgUrl)
    setShowImg(true)
  }

  const handleDeleteVisita = async () => {
    if (visita?.id) {
      try {
        await axios.delete(`/api/visitas/visitas?id=${visita.id}`)
        onReload()
        onToastSuccessVisitaDel()
        onOpenCloseDetalles()
      } catch (error) {
        console.error('Error al eliminar la visita:', error)
      }
    } else {
      console.error('Visita o ID no disponible')
    }
  };

  const handleDownloadQRCode = async () => {
    if (!visita || !visita.qrCode) {
      console.error('El objeto visita o qrCode no está definido')
      return;
    }

    try {
      const img = new Image()
      img.crossOrigin = 'Anonymous';
      img.src = visita.qrCode;

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          console.error('El contexto del canvas no está disponible')
          return;
        }

        const qrCodeSize = 300;
        const textHeight = 60; // Ajusta este valor para el texto superior
        const additionalTextHeight = 60; // Ajusta este valor para el texto inferior
        const width = qrCodeSize;
        const height = qrCodeSize + textHeight + additionalTextHeight;

        canvas.width = width;
        canvas.height = height;

        // Fondo blanco
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height)

        // Texto que va encima del código QR
        const headerText = 'Código de acceso\n' +
          `${visita.codigo}`;

        ctx.font = '18px Calibri'; // Tamaño de la fuente para el texto
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center'; // Alinea el texto al centro horizontalmente
        ctx.textBaseline = 'top'; // Alinea el texto al tope

        // Divide el texto en líneas y calcula la posición Y inicial
        const lines = headerText.split('\n')
        const lineHeight = 25; // Altura entre líneas
        let textY = 25; // Espacio desde el borde superior del canvas

        // Dibuja cada línea del texto
        lines.forEach((line) => {
          ctx.fillText(line, width / 2, textY) // Centra el texto horizontalmente
          textY += lineHeight; // Ajusta el espaciado entre líneas
        })

        // Dibuja el código QR debajo del texto
        const qrY = 70; // Reducido el espacio entre el texto y el QR

        ctx.drawImage(img, 0, qrY, qrCodeSize, qrCodeSize)

        const usuarioPrivada = visita.usuario_privada !== null ? visita.usuario_privada : '';
        const usuarioCalle = visita.usuario_calle !== null ? visita.usuario_calle : '';
        const usuarioCasa = visita.usuario_casa && visita.usuario_casa !== '0' ? `#${visita.usuario_casa}` : ''

        // Texto que va debajo del código QR
        const additionalText = `${visita.usuario_nombre}\n` +
          `${usuarioPrivada} ${usuarioCalle} ${usuarioCasa}`;

        ctx.font = '18px Calibri'; // Tamaño de la fuente para el texto adicional
        const additionalLines = additionalText.split('\n')
        const additionalLineHeight = 20; // Altura entre líneas del texto adicional
        let additionalTextY = 5 + qrCodeSize + 60 // Espacio después del código QR

        // Dibuja cada línea del texto adicional
        additionalLines.forEach((line) => {
          ctx.fillText(line, width / 2, additionalTextY) // Centra el texto horizontalmente
          additionalTextY += additionalLineHeight; // Ajusta el espaciado entre líneas
        })

        // Crear enlace para descargar la imagen
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png')
        link.download = `qrCode_${usuarioCalle}_${usuarioCasa}`;
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      };

      img.onerror = (error) => {
        console.error('Error al cargar la imagen QR Code', error)
      }

      onToastSuccessDownloadQR()
    } catch (error) {
      console.error('Error al descargar la imagen QR Code:', error)
    }
  }

  const handleShare = async () => {
    if (!visita || !visita.qrCode) {
      console.error('El objeto visita o qrCode no está definido');
      return;
    }

    if (!navigator.share) {
      console.error('La API de Web Share no está soportada en este navegador');
      return;
    }

    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = visita.qrCode;

      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const qrCodeSize = 300;
        const textHeight = 60;
        const additionalTextHeight = 60;
        const width = qrCodeSize;
        const height = qrCodeSize + textHeight + additionalTextHeight;

        canvas.width = qrCodeSize / 2
        canvas.height = (qrCodeSize / 2) + (textHeight / 2) + (additionalTextHeight / 2)

        // Fondo blanco
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

        // Texto encima del QR
        const headerText = 'Código de acceso\n' +
          `${visita.codigo}`;
        ctx.font = '18px Calibri';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const lines = headerText.split('\n');
        const lineHeight = 25;
        let textY = 25;

        lines.forEach((line) => {
          ctx.fillText(line, width / 2, textY);
          textY += lineHeight;
        });

        const qrY = 70;
        ctx.drawImage(img, 0, qrY, qrCodeSize, qrCodeSize);

        const usuarioPrivada = visita.usuario_privada !== null ? visita.usuario_privada : '';
        const usuarioCalle = visita.usuario_calle !== null ? visita.usuario_calle : '';
        const usuarioCasa = visita.usuario_casa && visita.usuario_casa !== '0' ? `#${visita.usuario_casa}` : ''

        // Texto que va debajo del código QR
        const additionalText = `${visita.usuario_nombre}\n` +
          `${usuarioPrivada} ${usuarioCalle} ${usuarioCasa}`;

        const additionalLines = additionalText.split('\n');
        const additionalLineHeight = 20;
        let additionalTextY = 5 + qrCodeSize + 60;

        additionalLines.forEach((line) => {
          ctx.fillText(line, width / 2, additionalTextY);
          additionalTextY += additionalLineHeight;
        });

        // Convertir el canvas en un archivo blob para compartir
        canvas.toBlob(async (blob) => {
          const file = new File([blob], `qrCode_${usuarioCalle}_${usuarioCasa}.png`, { type: 'image/png' });

          if (navigator.share) {
            try {
              await navigator.share({
                title: 'Código QR de acceso',
                text: `Nombre de la visita: ${visita.visita}\nCódigo de acceso: ${visita.codigo}`,
                files: [file], // Compartir el archivo con datos adicionales
              });
              console.log('QR compartido exitosamente');
            } catch (error) {
              console.error('Error al compartir el QR:', error);
            }
          } else {
            console.error('La API de Web Share no está soportada en este navegador');
          }
        });
      };

      img.onerror = (error) => {
        console.error('Error al cargar la imagen QR Code para compartir', error);
      };
    } catch (error) {
      console.error('Error al compartir el QR:', error);
    }
  }

  const imageKeys = ['img1', 'img2', 'img3', 'img4']

  return (
    <>
      {showDownQR && <ToastSuccessQR onToastSuccessDownloadQR={onToastSuccessDownloadQR} />}

      <IconClose onOpenClose={onOpenCloseDetalles} />

      <div className={styles.section}>
        <div className={styles.box1}>
          <div className={styles.box1_1}>
            <div>
              <h1>Nombre de la visita</h1>
              <h2>{visita.visita}</h2>
            </div>
            <div className={styles.tipoAcc}>
              <h1>Tipo de acceso</h1>
              <div onClick={onOpenCloseTipoAcc}>
                <h2>{visita.tipoacceso}</h2>
                <FaInfoCircle />
              </div>
            </div>
            <div className={styles.reporta}>
              <h1>Residente</h1>
              <div onClick={onOpenCloseRes}>
                <h2>{visita.usuario_nombre}</h2>
                <FaInfoCircle />
              </div>
            </div>
          </div>
          <div className={styles.box1_2}>
            <div>
              <h1>Tipo de visita</h1>
              <h2>{visita.tipovisita}</h2>
            </div>
            <div>
              <h1>Estatus</h1>
              <h2>{visita.estado}</h2>
            </div>
          </div>
        </div>

        <div className={styles.imgContent}>
          {imageKeys.map(imgKey => (
            <div key={imgKey}>
              {visita[imgKey] === null ? (
                <FaImage onClick={() => onShowSubirImg(imgKey)} />
              ) : (
                <ImageSemantic src={visita[imgKey]} onClick={() => openImg(visita[imgKey], imgKey)} />
              )}
            </div>
          ))}
        </div>

        <div className={styles.codigo}>
          <h1>Código de acceso</h1>
          <h2>{visita.codigo}</h2>
          {visita.qrCode && (
            <ImageSemantic src={visita.qrCode} />                      
          )}
        </div>

        {user.isadmin === 'Admin' || visita.usuario_id === user.id ? (
          <>
            <div className={styles.iconEdit}>
              <FaEdit onClick={onOpenEditVisita} />
            </div>

            <div className={styles.actionsBottom}>
              <div>
                <div className={styles.iconDown}>
                  <FaDownload onClick={handleDownloadQRCode} />
                </div>
                <div className={styles.iconShare}>
                  <FaShareAlt onClick={handleShare} />
                </div>
              </div>
              {user.isadmin === 'Admin' || visita.usuario_id === user.id ? (
                <div className={styles.iconDel}>
                  <FaTrash onClick={onOpenCloseConfirmDel} />
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>

      <BasicModal title='Editar visita' show={showEditVisita} onClose={onOpenEditVisita}>
        <VisitaEditForm reload={reload} onReload={onReload} visita={visita} onOpenEditVisita={onOpenEditVisita} onToastSuccessVisitaMod={onToastSuccessVisitaMod} />
      </BasicModal>

      <BasicModal
        title={
          visita.tipoacceso === 'frecuente'
            ? 'Días y fecha para accesar'
            : visita.tipoacceso === 'eventual'
              ? 'Fecha para accesar'
              : ''
        }
        show={showTipoAcc}
        onClose={onOpenCloseTipoAcc}
      >

        <IconClose onOpenClose={onOpenCloseTipoAcc} />
        <div className={styles.diasMain}>
          {visita.tipoacceso === 'frecuente' ? (
            <>
              <h1>{visita.dias}</h1>
              <h2>Desde</h2>
              <h3>{formatDate(visita.fromDate)}</h3>
              <h2>Hasta</h2>
              <h3>{formatDate(visita.toDate)}</h3>
            </>
          ) : visita.tipoacceso === 'eventual' ? (
            <h1>{formatDate(visita.date)}</h1>
          ) : null}
        </div>
      </BasicModal>


      <BasicModal title='datos de residente' show={showRes} onClose={onOpenCloseRes}>
        <DatosRes
          usuario={visita.usuario_nombre}
          priv={visita.usuario_privada}
          calle={visita.usuario_calle}
          casa={visita.usuario_casa}
          onOpenCloseRes={onOpenCloseRes} />
      </BasicModal>

      <BasicModal show={showImg} onClose={() => setShowImg(false)}>
        <ModalImg
          img={selectedImg}
          openImg={() => setShowImg(false)}
          delImage={false}
        />
      </BasicModal>

      <Confirm
        open={showConfirmDel}
        cancelButton={
          <div className={styles.iconClose}>
            <FaTimes />
          </div>
        }
        confirmButton={
          <div className={styles.iconCheck}>
            <FaCheck />
          </div>
        }
        onConfirm={handleDeleteVisita}
        onCancel={onOpenCloseConfirmDel}
        content='¿ Estas seguro de eliminar la visita ?'
      />
    </>
  )
}