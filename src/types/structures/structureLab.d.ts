interface StructureLab {
    labType: any;
    mineralIn?: MineralConstant;
    compoundIn?: _ResourceConstantSansEnergy;
    compoundOut?: _ResourceConstantSansEnergy;
    boostTarget?: BoostTarget;
    log(msg: string): void;
}

interface BoostTarget {
    roleName: string;
    compound: _ResourceConstantSansEnergy;
}

interface LabReaction {
    targetLab: StructureLab;
    sourceLabl: StructureLab;
    sourceLab2: StructureLab;
}
