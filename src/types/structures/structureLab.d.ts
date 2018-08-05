interface StructureLab {
    labType: any;
    mineralIn?: MineralConstant;
    compoundIn?: _ResourceConstantSansEnergy;
    compoundOut?: _ResourceConstantSansEnergy;
    boostTarget?: BoostTarget;
    reaction?: LabReaction;
    log(msg: string): void;
}

interface BoostTarget {
    roleName: string;
    compound: _ResourceConstantSansEnergy;
}

interface LabReaction {
    targetLab: StructureLab;
    sourceLab1: StructureLab;
    sourceLab2: StructureLab;
}
