interface StructureLab {
    labType: any;
    mineralIn?: MineralConstant;
    compoundIn?: ResourceConstant;
    compoundOut?: ResourceConstant;
    log(msg: string): void;
    boostTarget?: BoostTarget;
}

interface BoostTarget {
    roleName: string;
    compound: ResourceConstant;
}

interface LabReaction {
    targetLab: StructureLab;
    sourceLabl: StructureLab;
    sourceLab2: StructureLab;
}
