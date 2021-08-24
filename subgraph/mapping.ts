import { BigInt, Address, ipfs, json, JSONValueKind, log } from "@graphprotocol/graph-ts"
import { ClaimToken, newClaimCreated, OnMarket, Sold } from "./generated/ClaimToken/ClaimToken"
import { Claim, Manager, DailyTotal, Total } from "./generated/schema"


export function handleNewClaimCreated(event: newClaimCreated): void {

  let manager = Manager.load(event.params.assetManager.toHexString())

  if (manager == null) {
    manager = new Manager(event.params.assetManager.toHexString())
    manager.address = event.params.assetManager
  }

  let claim = Claim.load(event.params.id.toHexString())

  if (claim == null) {
    claim = new Claim(event.params.id.toHexString())
    incrementTotal('tokens',event.block.timestamp, BigInt.fromI32(1))
  }

  claim.material = event.params.material
  claim.barcodeId = event.params.barcodeId
  claim.assetManager = manager.id
  claim.currentOwner = event.params.assetManager
  claim.beneficiaryPay = event.params.beneficiaryPay
  claim.value = (event.params.beneficiaryPay).times(BigInt.fromI32(10))
  claim.propertiesHash = event.params.propertiesHash
  claim.exists = true
  claim.onMarket = false
  claim.sold = false

  claim.save()
  manager.save()

  incrementTotal('claims',event.block.timestamp, BigInt.fromI32(1))
}

export function handleOnMarket(event: OnMarket): void {

  let claim = Claim.load(event.params.tokenID.toHexString())
  claim.currentOwner = event.params.claimOwner
  claim.onMarket = true

  claim.save()
}

export function handleSold(event: Sold): void {
  
  let claim = Claim.load(event.params.tokenID.toHexString())
  claim.currentOwner = event.params.newOwner
  claim.onMarket = false
  claim.sold = true

  claim.save()
 
  incrementTotal('sales',event.block.timestamp, event.params.value)
}

function incrementTotal(metric: String, timestamp: BigInt, value: BigInt): void {

  let stats = Total.load("latest")
  let day = timestamp

  if (stats == null) {
    stats = new Total("latest")
  }
  else {
    if (stats.day !== day) {
      let yesterdayStats = stats
      yesterdayStats.id = stats.day.toString()
      yesterdayStats.save()
      stats.id = "latest"
    }
  }

  let dailyStats = DailyTotal.load(day.toString())

  if (dailyStats == null) {
    dailyStats = new DailyTotal(day.toString())
    dailyStats.day = day
  }

  stats.day = day

  if (metric == 'tokens') {
    stats.tokens = stats.tokens + value
    dailyStats.tokens = dailyStats.tokens + value
  }
  else if (metric == 'sales') {
    stats.sales = stats.sales + value
    dailyStats.sales = dailyStats.sales + value
  }

  stats.save()
  dailyStats.save()
}

