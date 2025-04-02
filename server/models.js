const mongoose = require('mongoose');

// 피실험자 로그데이터 스키마 구성
const userSchema = new mongoose.Schema({
    userId: Number,             // 실험 순서
    totalInteractions: Number,
    nodes: [nodeSchema]
});

export const User = mongoose.model('User', userSchema);

// node 내 로그데이터 스키마 구성
const nodeSchema = new mongoose.Schema({
    textCount: Number,    
    inputToken: Number,
    outputToken: Number,
});

export const Node = mongoose.model('Node', nodeSchema);

