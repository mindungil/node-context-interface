const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);

// node 내 로그데이터 스키마
const nodeSchema = new mongoose.Schema({
    texts: { type: Number, default: 0 },    
    prompt_tokens: { type: Number, default: 0 },
    completion_tokens: { type: Number, default: 0 },
    total_tokens: { type: Number, default: 0 },
});

const Node = mongoose.model('Node', nodeSchema);

// 피실험자 로그데이터 스키마
const userSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },                 // 실험 순서
    totalInteractions: { type: Number, default: 0 },
    nodes: [nodeSchema]
});

userSchema.plugin(autoIncrement, { inc_field: 'userId' });  // userID 자동으로 1 씩 증가 
                                                            // -> 실험 순서(번호)
const User = mongoose.model('User', userSchema);

module.exports = { User, Node };