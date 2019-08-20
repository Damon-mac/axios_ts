import { CancelExecutor, Canceler, CancelTokenSource } from '../types'
import Cancel from './Cancel' // 因为接下来要把它当做值去使用而不能仅当做类型,所以不能从types里面去取. 类的定义既可以当做值也可以当做类型去使用

interface ResolvePromise {
  (reason?: Cancel): void
}

export default class CancelToken {
  promise: Promise<Cancel> // reason变了Promise也要变,因为reason是Promise的resolve的参数类型
  reason?: Cancel

  constructor(executor: CancelExecutor) {
    let resolvePromise: ResolvePromise
    this.promise = new Promise<Cancel>(resolve => {
      resolvePromise = resolve
    })

    executor(message => {
      if (this.reason) {
        return
      }
      this.reason = new Cancel(message)
      resolvePromise(this.reason)
    })
  }
  throwIfRequested(): void {
    if (this.reason) {
      // reason不为空说明executor里的cancel方法被执行过了
      throw this.reason
    }
  }

  static source(): CancelTokenSource {
    let cancel!: Canceler
    const token = new CancelToken(c => {
      cancel = c
    })
    return {
      cancel,
      token
    }
  }
}
