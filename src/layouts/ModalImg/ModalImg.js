import { IconClose, Loading } from '@/components/Layouts'
import styles from './ModalImg.module.css'
import { Image } from 'semantic-ui-react'
import { FaTrash } from 'react-icons/fa'

export function ModalImg(props) {

  const {user, img, imgKey, openImg, onShowConfirmDelImg, delImage=true} = props
  
  return (
    
    <>
    
      <IconClose onOpenClose={openImg} />

      {!img ? 
        <Loading size={40} loading={1} /> :
        <div className={styles.img}>
        <Image src={img} />
        {delImage && (user.isadmin === 'Admin' || user.isadmin === 'Técnico') ?
          <FaTrash onClick={() => onShowConfirmDelImg(imgKey)} /> : null
        }
      </div>
      }

    </>

  )
}
