import bcrypt  from 'bcrypt';

export const Hash = ({key , SALT_ROUNDS = SALT_ROUNDS})=>{
    return bcrypt.hashSync(key,+process.env.SALT_ROUNDS)
}

export const compare = ({key,hashed})=>{
    return bcrypt.compareSync(key,hashed)
}