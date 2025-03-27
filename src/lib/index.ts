export interface IndividualFleetTech {
    Health?: number
    Firepower?: number
    Torpedo?: number
    AA?: number
    Aviation?: number
    Reload?: number
    Armor?: number
    Accuracy?: number
    Evasion?: number
    Speed?: number
    Luck?: number
    ASW?: number
}

export interface FleetTech {
    DD?: IndividualFleetTech
    CL?: IndividualFleetTech
    CA?: IndividualFleetTech
    BC?: IndividualFleetTech
    BB?: IndividualFleetTech
    CVL?: IndividualFleetTech
    CV?: IndividualFleetTech
    SS?: IndividualFleetTech
    BBV?: IndividualFleetTech
    AR?: IndividualFleetTech
    BM?: IndividualFleetTech
    SSV?: IndividualFleetTech
    CB?: IndividualFleetTech
    AE?: IndividualFleetTech
    IXS?: IndividualFleetTech
    IXV?: IndividualFleetTech
    IXM?: IndividualFleetTech
}

export interface Config {
    outputName: string
    fleetBuilderLink: string
    attempts: number
    enemyId: number
    dungeonId: number
    const: object
    ft: FleetTech
}

export interface IndividualStatistics {
    Remaing_HP: number
    AA: number
    DoT: number
    DMG: number
}

export interface History {
    airstrikes: Record<string, Record<string, boolean>>
    torps: Record<string, Record<string, boolean>>
    salvos: Record<string, Record<string, boolean>>
}

export interface Results {
    Battle_Length: number
    Remaining_HP: number
    Statistics: Record<string, IndividualStatistics>
    Timed_Damage: Record<string, Record<string, number>>
    History: History
}

export const TAB_SIZE: number = 40;

export const IndividualGraphTypes = {
    Timelines: "Timlines",
    AvgTimeline: "Average Timeline",
    SurfaceDmgDist: "Surface Damage Distribution",
    DoTDmgDist: "DoT Damage Distribution",
    AADmgDist: "AA Damage Distribution",
    LengthOfBattle: "Length of Battle",
    RemainingHP: "Remaining HP% of Ships",
    StandardizedDmg: "Standardized Total Damage",
}
export const GroupGraphTypes = {
    DmgDist: "Damage Distribution",
    StdDev: "Standard Deviation",
    KillPerc: "Kill %",
}