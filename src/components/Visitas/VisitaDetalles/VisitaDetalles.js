import { IconClose, Confirm, DatosRes, ToastSuccessQR, UploadImg } from '@/components/Layouts';
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
  const { user } = useAuth();

  const [showEditVisita, setShowEditVisita] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [showTipoAcc, setShowTipoAcc] = useState(false);
  const [showConfirmDel, setShowConfirmDel] = useState(false);
  const [showDownQR, setShowDownQR] = useState(false);
  const [showImg, setShowImg] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedImageKey, setSelectedImageKey] = useState(null);
  const [showSubirImg, setShowSubirImg] = useState(false);

  const [imgKeyToDelete, setImgKeyToDelete] = useState(null);
  const [showConfirmDelImg, setShowConfirmDelImg] = useState(false);

  const imageKeys = ['img1', 'img2', 'img3', 'img4'];

  const onOpenEditVisita = () => setShowEditVisita((prevState) => !prevState);
  const onOpenCloseRes = () => setShowRes((prevState) => !prevState);
  const onOpenCloseTipoAcc = () => setShowTipoAcc((prevState) => !prevState);
  const onOpenCloseConfirmDel = () => setShowConfirmDel((prevState) => !prevState);
  const onToastSuccessDownloadQR = () => setShowDownQR((prevState) => !prevState);

  const openImg = (imgUrl, imgKey) => {
    setSelectedImg(imgUrl);
    setImgKeyToDelete(imgKey);
    setShowImg(true);
  };

  const onShowSubirImg = (imgKey) => {
    setSelectedImageKey(imgKey);
    setShowSubirImg(true);
  };

  const onCloseSubirImg = () => {
    setShowSubirImg(false);
    setSelectedImageKey(null);
  };

  const handleImageUploadSuccess = (imageKey, imageUrl) => {
    onReload();
    setShowSubirImg(false);
  };

  const handleDeleteImage = async () => {
    try {
      await axios.delete(`/api/visitas/uploadImage`, {
        params: {
          id: visita.id,
          imageKey: imgKeyToDelete,
        },
      });

      onReload();
      setShowImg(false);
      setShowConfirmDelImg(false);
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
    }
  };

  const onShowConfirmDelImg = (imgKey) => {
    setImgKeyToDelete(imgKey);
    setShowConfirmDelImg(true);
  };

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
                  <FaDownload onClick={() => {}} />
                </div>
                <div className={styles.iconShare}>
                  <FaShareAlt onClick={() => {}} />
                </div>
              </div>
              <div className={styles.iconDel}>
                <FaTrash onClick={onOpenCloseConfirmDel} />
              </div>
            </div>
          </>
        ) : null}
      </div>

      <BasicModal title="Editar visita" show={showEditVisita} onClose={onOpenEditVisita}>
        <VisitaEditForm reload={reload} onReload={onReload} visita={visita} onOpenEditVisita={onOpenEditVisita} onToastSuccessVisitaMod={onToastSuccessVisitaMod} />
      </BasicModal>

      <BasicModal title="Subir imagen" show={showSubirImg} onClose={onCloseSubirImg}>
        {selectedImageKey && (
          <UploadImg
            reload={reload}
            onReload={onReload}
            itemId={visita.id}
            onShowSubirImg={onCloseSubirImg}
            selectedImageKey={selectedImageKey}
            endpoint="visitas"
            onSuccess={handleImageUploadSuccess}
          />
        )}
      </BasicModal>

      <BasicModal show={showImg} onClose={() => setShowImg(false)}>
        <ModalImg
          img={selectedImg}
          openImg={() => setShowImg(false)}
          onShowConfirmDelImg={() => onShowConfirmDelImg(imgKeyToDelete)}
          imgKey={imgKeyToDelete}
        />
      </BasicModal>

      <Confirm
        open={showConfirmDelImg}
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
        onConfirm={handleDeleteImage}
        onCancel={() => setShowConfirmDelImg(false)}
        content="¿Estás seguro de eliminar la imagen?"
      />

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
        onConfirm={() => {}}
        onCancel={onOpenCloseConfirmDel}
        content="¿Estás seguro de eliminar la visita?"
      />
    </>
  );
}