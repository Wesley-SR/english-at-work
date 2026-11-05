export const cards = [
  {
    "id": 1,
    "en": "We need to look into this issue.",
    "pt": "Precisamos investigar esse problema."
  },
  {
    "id": 2,
    "en": "Let's take a closer look at the results.",
    "pt": "Vamos analisar os resultados mais de perto."
  },
  {
    "id": 3,
    "en": "Based on the data, it looks like the controller is reacting too slowly.",
    "pt": "Com base nos dados, parece que o controlador está reagindo muito lentamente."
  },
  {
    "id": 4,
    "en": "The signal is not behaving as expected.",
    "pt": "O sinal não está se comportando como esperado."
  },
  {
    "id": 5,
    "en": "Just a friendly reminder to review my changes when you have a chance.",
    "pt": "Só um lembrete amigável para revisar minhas alterações quando você tiver um tempinho."
  },
  {
    "id": 6,
    "en": "Do you happen to know if the logs from the methane number tests are available?",
    "pt": "Por acaso você sabe se os logs dos testes de número de metano estão disponíveis?"
  },
  {
    "id": 7,
    "en": "We need to assess whether the methane number affects knock behavior.",
    "pt": "Precisamos avaliar se o número de metano afeta o comportamento de knock."
  },
  {
    "id": 8,
    "en": "It's too early to draw any conclusions.",
    "pt": "Ainda é cedo para tirar conclusões."
  },
  {
    "id": 9,
    "en": "We need to figure out why this is happening.",
    "pt": "Precisamos descobrir por que isso está acontecendo."
  },
  {
    "id": 10,
    "en": "Can I proceed with this approach?",
    "pt": "Posso prosseguir com essa abordagem?"
  },
  {
    "id": 11,
    "en": "So far, I haven't been able to identify the root cause.",
    "pt": "Até agora, não consegui identificar a causa raiz."
  },
  {
    "id": 12,
    "en": "What is the vehicle's total mileage?",
    "pt": "Qual é a quilometragem total do veículo?"
  },
  {
    "id": 13,
    "en": "We need to narrow down the possible causes.",
    "pt": "Precisamos reduzir as possíveis causas."
  },
  {
    "id": 14,
    "en": "Could you share the latest logs so I can analyze the results?",
    "pt": "Você poderia compartilhar os logs mais recentes para que eu possa analisar os resultados?"
  },
  {
    "id": 15,
    "en": "I haven't had a chance to review the calibration changes yet.",
    "pt": "Ainda não tive a oportunidade de revisar as alterações de calibração."
  },
  {
    "id": 16,
    "en": "We should compare these measurements with the previous test results.",
    "pt": "Deveríamos comparar essas medições com os resultados dos testes anteriores."
  },
  {
    "id": 17,
    "en": "The issue seems to occur only when the engine is accelerating.",
    "pt": "O problema parece ocorrer somente quando o motor está acelerando."
  },
  {
    "id": 18,
    "en": "I'll investigate the error and get back to you as soon as I have an update.",
    "pt": "Vou investigar o erro e te dar um retorno assim que tiver uma atualização."
  },
  {
    "id": 19,
    "en": "Could you clarify which signal we should use for this calculation?",
    "pt": "Você poderia esclarecer qual sinal devemos usar para esse cálculo?"
  },
  {
    "id": 20,
    "en": "We need more data before deciding whether to change the control strategy.",
    "pt": "Precisamos de mais dados antes de decidir se vamos alterar a estratégia de controle."
  },
  {
    "id": 21,
    "en": "During offset learning, the system was operating under special conditions, but the lambda integrator was still behaving as if normal closed-loop control were active.",
    "pt": "Durante o aprendizado de offset, o sistema operava em condições especiais, mas o integrador lambda ainda se comportava como se o controle normal em malha fechada estivesse ativo."
  },
  {
    "id": 22,
    "en": "That led to integrator windup and could cause a strong correction pulse when returning to normal operation.",
    "pt": "Isso levou ao acúmulo excessivo no integrador (windup) e poderia causar um forte pulso de correção ao retornar à operação normal."
  },
  {
    "id": 23,
    "en": "We added a condition to freeze the lambda PID integrator while offset learning is active.",
    "pt": "Adicionamos uma condição para congelar o integrador do controlador PID lambda enquanto o aprendizado de offset estiver ativo."
  },
  {
    "id": 24,
    "en": "This reduces transient fueling disturbance and improves control robustness during the transition.",
    "pt": "Isso reduz as perturbações transitórias na alimentação de combustível e melhora a robustez do controle durante a transição."
  },
  {
    "id": 25,
    "en": "We are evaluating whether reactivation should be immediate or slightly delayed after learning completes.",
    "pt": "Estamos avaliando se a reativação deve ser imediata ou ligeiramente atrasada após a conclusão do aprendizado."
  },
  {
    "id": 26,
    "en": "Today I will present a control improvement related to gas mixer offset learning.",
    "pt": "Hoje vou apresentar uma melhoria de controle relacionada ao aprendizado de offset do gas mixer."
  },
  {
    "id": 27,
    "en": "This story is about preventing unwanted lambda correction during offset learning.",
    "pt": "Esta apresentação trata de como evitar correções indesejadas de lambda durante o aprendizado de offset."
  },
  {
    "id": 28,
    "en": "We identified an issue in the interaction between offset learning and lambda feedback control.",
    "pt": "Identificamos um problema na interação entre o aprendizado de offset e o controle de lambda por realimentação."
  },
  {
    "id": 29,
    "en": "During gas mixer offset learning, the gas mixer position is held fixed.",
    "pt": "Durante o aprendizado de offset do gas mixer, a posição do gas mixer é mantida fixa."
  },
  {
    "id": 30,
    "en": "In this phase, fuel delivery is not controlled in the normal closed-loop way.",
    "pt": "Nessa fase, o fornecimento de combustível não é controlado da maneira normal em malha fechada."
  },
  {
    "id": 31,
    "en": "However, the lambda controller could still continue integrating the lambda error.",
    "pt": "No entanto, o controlador lambda ainda podia continuar integrando o erro de lambda."
  },
  {
    "id": 32,
    "en": "This caused a large correction to accumulate in the integrator.",
    "pt": "Isso fez com que uma grande correção se acumulasse no integrador."
  },
  {
    "id": 33,
    "en": "When the learning phase ended, that stored correction could be applied immediately.",
    "pt": "Quando a fase de aprendizado terminava, essa correção acumulada podia ser aplicada imediatamente."
  },
  {
    "id": 34,
    "en": "This could cause a rich or lean transient when normal control resumes.",
    "pt": "Isso poderia causar um transiente de mistura rica ou pobre quando o controle normal fosse retomado."
  },
  {
    "id": 35,
    "en": "As a result, we could see undesirable behavior after the learning was finished.",
    "pt": "Como resultado, podíamos observar um comportamento indesejado após o término do aprendizado."
  },
  {
    "id": 36,
    "en": "In short, this was a windup problem.",
    "pt": "Em resumo, era um problema de windup do integrador."
  },
  {
    "id": 37,
    "en": "To solve this, we added a function to freeze the lambda PID integrator during offset learning.",
    "pt": "Para resolver isso, adicionamos uma função para congelar o integrador do controlador PID lambda durante o aprendizado de offset."
  },
  {
    "id": 38,
    "en": "This prevents the controller from accumulating correction when the system is in a special mode.",
    "pt": "Isso impede que o controlador acumule correção quando o sistema está em um modo especial."
  },
  {
    "id": 39,
    "en": "The key idea is simple: do not let the integrator wind up during offset learning.",
    "pt": "A ideia principal é simples: não permitir que ocorra windup do integrador durante o aprendizado de offset."
  },
  {
    "id": 40,
    "en": "With this change, the transition back to normal control becomes smoother.",
    "pt": "Com essa alteração, a transição de volta ao controle normal se torna mais suave."
  },
  {
    "id": 41,
    "en": "This reduces the risk of rich or lean spikes after learning.",
    "pt": "Isso reduz o risco de picos de mistura rica ou pobre após o aprendizado."
  },
  {
    "id": 42,
    "en": "The improvement increases control robustness and gives more stable behavior.",
    "pt": "A melhoria aumenta a robustez do controle e proporciona um comportamento mais estável."
  },
  {
    "id": 43,
    "en": "We also evaluated whether the controller should be reactivated immediately or after a short delay.",
    "pt": "Também avaliamos se o controlador deveria ser reativado imediatamente ou após um pequeno atraso."
  },
  {
    "id": 44,
    "en": "This point will be confirmed through validation.",
    "pt": "Esse ponto será confirmado por meio de validação."
  },
  {
    "id": 45,
    "en": "If needed, a short delay can be added after learning is completed.",
    "pt": "Se necessário, um pequeno atraso pode ser adicionado após a conclusão do aprendizado."
  },
  {
    "id": 46,
    "en": "So, the main value of this change is preventing integrator windup during offset learning.",
    "pt": "Portanto, o principal benefício dessa alteração é evitar o windup do integrador durante o aprendizado de offset."
  },
  {
    "id": 47,
    "en": "This is a small change, but it improves the handover back to normal lambda control.",
    "pt": "É uma pequena alteração, mas melhora a transição de volta ao controle normal de lambda."
  },
  {
    "id": 48,
    "en": "That concludes my overview of this control improvement.",
    "pt": "Isso conclui minha apresentação geral dessa melhoria de controle."
  },
  {
    "id": 49,
    "en": "I'll give you an overview of how it works and its main features.",
    "pt": "Vou apresentar uma visão geral de como funciona e de suas principais funcionalidades."
  },
  {
    "id": 50,
    "en": "In the picture on the right, we can see where the component is located.",
    "pt": "Na imagem à direita, podemos ver onde o componente está localizado."
  },
  {
    "id": 51,
    "en": "Before we can start testing, we need to go through several steps.",
    "pt": "Antes de começar os testes, precisamos passar por várias etapas."
  },
  {
    "id": 52,
    "en": "The main difference is that we're using a simulator instead of the physical component.",
    "pt": "A principal diferença é que estamos usando um simulador em vez do componente físico."
  },
  {
    "id": 53,
    "en": "These features allow us to test different operating conditions.",
    "pt": "Essas funcionalidades nos permitem testar diferentes condições de operação."
  },
  {
    "id": 54,
    "en": "I won't go into too much technical detail today.",
    "pt": "Não vou entrar em muitos detalhes técnicos hoje."
  },
  {
    "id": 55,
    "en": "Now that we have the context, let's look at why we developed the simulator.",
    "pt": "Agora que temos o contexto, vamos ver por que desenvolvemos o simulador."
  },
  {
    "id": 56,
    "en": "With that in mind, let's move on to the next point.",
    "pt": "Com isso em mente, vamos passar para o próximo ponto."
  },
  {
    "id": 57,
    "en": "Finally, let's look at the test setup.",
    "pt": "Por fim, vamos analisar a configuração de testes."
  },
  {
    "id": 58,
    "en": "If anyone needs help with this project, please feel free to reach out to me.",
    "pt": "Se alguém precisar de ajuda com este projeto, fique à vontade para entrar em contato comigo."
  },
  {
    "id": 59,
    "en": "That concludes my presentation. Thank you for your attention. Does anyone have any questions?",
    "pt": "Isso conclui minha apresentação. Obrigado pela atenção. Alguém tem alguma pergunta?"
  },
  {
    "id": 60,
    "en": "These findings suggest that combining ion current and knock indicators enhances knock detection reliability.",
    "pt": "Esses resultados sugerem que combinar a corrente de ionização e os indicadores de knock aumenta a confiabilidade da detecção de knock."
  },
  {
    "id": 61,
    "en": "Traditional knock detection methods primarily rely on vibration sensors attached to the engine block.",
    "pt": "Os métodos tradicionais de detecção de knock dependem principalmente de sensores de vibração instalados no bloco do motor."
  },
  {
    "id": 62,
    "en": "However, even though the results look promising, we still need to validate the method under different operating conditions.",
    "pt": "No entanto, embora os resultados pareçam promissores, ainda precisamos validar o método em diferentes condições de operação."
  },
  {
    "id": 63,
    "en": "The flame kernel's reaction to changes in the air-fuel mixture can affect early combustion stability.",
    "pt": "A reação do núcleo inicial de chama a mudanças na mistura ar-combustível pode afetar a estabilidade da combustão em sua fase inicial."
  },
  {
    "id": 64,
    "en": "They leveraged this by defining a parameter that combines information from both sensors.",
    "pt": "Eles aproveitaram isso ao definir um parâmetro que combina informações dos dois sensores."
  },
  {
    "id": 65,
    "en": "Beyond knock detection, ion current signals can provide useful information about the combustion process.",
    "pt": "Além da detecção de knock, os sinais de corrente de ionização podem fornecer informações úteis sobre o processo de combustão."
  },
  {
    "id": 66,
    "en": "In this manner, we can compare the two methods under the same operating conditions.",
    "pt": "Dessa forma, podemos comparar os dois métodos nas mesmas condições de operação."
  },
  {
    "id": 67,
    "en": "The proposed approach is straightforward to implement and validate.",
    "pt": "A abordagem proposta é simples de implementar e validar."
  }
];
