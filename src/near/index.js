import * as nearAPI from 'near-api-js'
import getConfig from './config'

const nearConfig = getConfig(process.env.NODE_ENV || 'development')

export async function initContract() {
    const near = await nearAPI.connect(Object.assign({
        deps: {
            keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore()
        }
    }, nearConfig))

    window.wallet = new nearAPI.WalletConnection(near)

    window.accountId = window.wallet.getAccountId()

    window.contract = await new nearAPI.Contract(window.wallet.account(), nearConfig.contractName, {
        viewMethods: ['get_bid', 'is_bid_made', 'get_auction_state'],
        changeMethods: ['make_bid', 'double_bit_refund', 'delete_bit'],
    })
}

export function connectWallet() {
    window.wallet.requestSignIn({ contractId: nearConfig.contractName })
}

export const logout = () => {
    window.wallet.signOut()
    location.reload()
}

export const getWalletId = () => {
    return window.accountId
}

export const getWalletBalance = async () => {
    const balance = (await window.wallet.account().state()).amount
    return nearAPI.utils.format.formatNearAmount(balance)
}

export const formatBalanceToHuman = async () => {
    return Number((await window.wallet.account().state()).amount).toFixed(3);
}

export async function doubleBitRefund() {
    await window.contract.double_bit_refund({args:{}}).catch(errorHandler)
}

export async function deleteBit() {
    await window.contract.delete_bit({args:{}}).catch(errorHandler)
}

export async function makeBid(bid) {
    await window.contract.make_bid({args:{}}, nearAPI.DEFAULT_FUNCTION_CALL_GAS, parseNearAmount(bid))
        .catch(errorHandler)
}

export async function getBid() {
    return await window.contract.get_bid({args:{}})
}

export async function isBidMade() {
    return await window.contract.is_bid_made({args:{}})
        .catch(errorHandler)
}

export function formatNearAmount(bid) {
    return nearAPI.utils.format.formatNearAmount(String(bid))
}

export function parseNearAmount(bid) {
    return nearAPI.utils.format.parseNearAmount(bid)
}


function errorHandler(err) {
    console.log(err)
}