import React from 'react'
import { IconUser } from './ui/icons'

interface Props {
    username: string
}

const IconUserName = ({ username }: Props ) => {
    if (!username) {
        return <IconUser />
    }
    const [firstName, lastName] = username.split(' ')
    const initials = lastName ? `${firstName[0]}${lastName[0]}` : firstName.slice(0, 2)
  return (
    <div>{initials}</div>
  )
}

export default IconUserName