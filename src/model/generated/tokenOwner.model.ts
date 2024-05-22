import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, BigIntColumn as BigIntColumn_, IntColumn as IntColumn_} from "@subsquid/typeorm-store"
import {BlockchainSymbol} from "./_blockchainSymbol"

@Entity_()
export class TokenOwner {
    constructor(props?: Partial<TokenOwner>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    ownerAddress!: string

    @Index_()
    @StringColumn_({nullable: false})
    tokenAddress!: string

    @Index_()
    @Column_("varchar", {length: 3, nullable: true})
    blockchainSymbol!: BlockchainSymbol | undefined | null

    @BigIntColumn_({nullable: false})
    balance!: bigint

    @Index_()
    @StringColumn_({nullable: true})
    userId!: string | undefined | null

    @Index_()
    @IntColumn_({nullable: false})
    lastUpdate!: number
}
