const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);

// node 내 로그데이터 스키마
const nodeSchema = new mongoose.Schema({
    texts: { type: Number, default: 0 },    
    prompt_tokens: { type: Number, default: 0 },
    completion_tokens: { type: Number, default: 0 },
    total_tokens: { type: Number, default: 0 },
});

const clientSchema = new mongoose.Schema({
    node: { type: Number, default: 0 },
    toggle_node: { type: Number, default: 0 },
    toggle_tree: { type: Number, default: 0 },
    toggle_linear: { type: Number, default: 0 },
    context_management: { type: Number, default: 0},
    send_message: { type: Number, default: 0 }
});

// 피실험자 로그데이터 스키마
const userSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },                 // 실험 순서
    totalInteractions: { type: Number, default: 0 },
    nodes: [nodeSchema],
    client: { type: clientSchema, default: () => ({})}
});

userSchema.plugin(autoIncrement, { inc_field: 'userId' });  // userID 자동으로 1 씩 증가 
                                                            // -> 실험 순서(번호)
const User = mongoose.model('User', userSchema);

// client 측 로그데이터 스키마

module.exports = User;